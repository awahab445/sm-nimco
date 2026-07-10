import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';

type AddressSnapshot = {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

type LabelItem = {
  name: string;
  quantity: number;
  lineTotal: string;
};

type ShippingLabelViewModel = {
  storeName: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  shippingAddress: string;
  phone: string | null;
  items: LabelItem[];
  itemCount: number;
  singleItem: boolean;
  paymentMethod: string;
  currency: string;
  subtotal: string;
  shippingCharges: string;
  taxTotal: string;
  discountTotal: string;
  hasDiscount: boolean;
  hasTax: boolean;
  grandTotal: string;
};

@Injectable()
export class ShippingLabelService {
  private readonly logger = new Logger(ShippingLabelService.name);
  private readonly compiledTemplate: HandlebarsTemplateDelegate;
  private readonly logoBase64: string;

  constructor(private readonly prisma: PrismaService) {
    const templatePath = this.resolveTemplatePath();
    const source = readFileSync(templatePath, 'utf8');
    this.compiledTemplate = Handlebars.compile(source);
    this.logoBase64 = this.loadBundledLogoBase64();
  }

  async generateBulkLabels(orderIds: string[]): Promise<Buffer> {
    const uniqueIds = [
      ...new Set(orderIds.map((id) => id.trim()).filter(Boolean)),
    ];
    if (uniqueIds.length === 0) {
      throw new BadRequestException('At least one order ID is required.');
    }

    const orders = await this.prisma.order.findMany({
      where: { id: { in: uniqueIds } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    if (orders.length !== uniqueIds.length) {
      const found = new Set(orders.map((order) => order.id));
      const missing = uniqueIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Orders not found: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`,
      );
    }

    const payments = await this.prisma.payment.findMany({
      where: { orderId: { in: uniqueIds } },
      include: { paymentMethod: true },
      orderBy: { createdAt: 'desc' },
    });

    const paymentMethodByOrderId = new Map<string, string>();
    for (const payment of payments) {
      if (!paymentMethodByOrderId.has(payment.orderId)) {
        paymentMethodByOrderId.set(payment.orderId, payment.paymentMethod.name);
      }
    }

    const storeName = process.env.STORE_NAME?.trim() || 'M. Essa Chemicals';

    const orderById = new Map(orders.map((order) => [order.id, order]));
    const labels: ShippingLabelViewModel[] = [];

    for (const orderId of uniqueIds) {
      const order = orderById.get(orderId);
      if (!order) {
        continue;
      }

      const shippingAddress = this.parseAddress(order.shippingAddress);
      const customerName =
        order.customerName?.trim() ||
        [shippingAddress.firstName, shippingAddress.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        'Customer';

      const items: LabelItem[] = [];
      for (const item of order.items) {
        items.push({
          name: item.name,
          quantity: item.quantity,
          lineTotal: this.formatMoney(item.rowTotal, order.currency),
        });
      }

      let itemCount = 0;
      for (const item of items) {
        itemCount += item.quantity;
      }

      const discountNumeric = this.toNumber(order.discountTotal);
      const taxNumeric = this.toNumber(order.taxTotal);

      labels.push({
        storeName,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toLocaleString('en-PK', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        customerName,
        shippingAddress: this.formatAddressBlock(shippingAddress),
        phone:
          shippingAddress.phone?.trim() ||
          this.parseAddress(order.billingAddress).phone?.trim() ||
          null,
        items,
        itemCount,
        singleItem: itemCount === 1,
        paymentMethod:
          paymentMethodByOrderId.get(order.id) ||
          this.formatPaymentStatus(order.paymentStatus),
        currency: order.currency,
        subtotal: this.formatMoney(order.subtotal, order.currency),
        shippingCharges: this.formatMoney(order.shippingTotal, order.currency),
        taxTotal: this.formatMoney(order.taxTotal, order.currency),
        discountTotal: this.formatMoney(order.discountTotal, order.currency),
        hasDiscount: discountNumeric > 0,
        hasTax: taxNumeric > 0,
        grandTotal: this.formatMoney(order.grandTotal, order.currency),
      });
    }

    const html = this.compiledTemplate({
      labels,
      logoBase64: this.logoBase64,
    });
    return this.renderPdf(html);
  }

  private resolveTemplatePath(): string {
    const candidates = [
      join(__dirname, '..', 'templates', 'shipping-label.hbs'),
      join(process.cwd(), 'dist', 'order', 'templates', 'shipping-label.hbs'),
      join(process.cwd(), 'src', 'order', 'templates', 'shipping-label.hbs'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    throw new Error('shipping-label.hbs template not found');
  }

  private parseAddress(value: Prisma.JsonValue): AddressSnapshot {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as AddressSnapshot;
  }

  private formatAddressBlock(address: AddressSnapshot): string {
    const lines = [
      address.company?.trim(),
      address.addressLine1?.trim(),
      address.addressLine2?.trim(),
      [address.city, address.state, address.postalCode]
        .filter(Boolean)
        .join(', ')
        .trim(),
      address.country?.trim(),
    ].filter((line): line is string => Boolean(line));

    return lines.join('\n') || '—';
  }

  private formatMoney(
    amount: Prisma.Decimal | string | number,
    currency: string,
  ): string {
    const numeric = this.toNumber(amount);

    if (Number.isNaN(numeric)) {
      return `${String(amount)} ${currency}`;
    }

    try {
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency,
      }).format(numeric);
    } catch {
      return `${numeric.toFixed(2)} ${currency}`;
    }
  }

  private toNumber(amount: Prisma.Decimal | string | number): number {
    if (typeof amount === 'string' || typeof amount === 'number') {
      return Number(amount);
    }
    return Number(amount.toString());
  }

  private formatPaymentStatus(status: string | null): string {
    if (!status) return 'Not specified';
    return status
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private loadBundledLogoBase64(): string {
    const logoPath = this.resolveBundledLogoPath();
    if (!logoPath) {
      throw new Error(
        'Shipping label logo not found at src/order/assets/brand-logo.png',
      );
    }

    const base64 = readFileSync(logoPath, 'base64');
    if (!base64?.trim()) {
      throw new Error('Shipping label logo file is empty');
    }

    return `data:image/png;base64,${base64}`;
  }

  private resolveBundledLogoPath(): string | null {
    const candidates = [
      join(process.cwd(), 'src', 'order', 'assets', 'brand-logo.png'),
      join(__dirname, '..', 'assets', 'brand-logo.png'),
      join(process.cwd(), 'dist', 'order', 'assets', 'brand-logo.png'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private async launchBrowser(): Promise<
    Awaited<ReturnType<typeof puppeteer.launch>>
  > {
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--allow-file-access-from-files',
      '--disable-web-security',
    ];

    const baseOptions = {
      headless: true as const,
      args: launchArgs,
      timeout: 120_000,
      protocolTimeout: 120_000,
    };

    try {
      const executablePath = await puppeteer.executablePath();
      return await puppeteer.launch({
        ...baseOptions,
        executablePath,
      });
    } catch (primaryError) {
      this.logger.warn(
        'Primary Puppeteer launch failed, retrying with default browser resolution',
        primaryError,
      );

      try {
        return await puppeteer.launch(baseOptions);
      } catch (fallbackError) {
        this.logger.error('Fallback Puppeteer launch failed', fallbackError);
        throw fallbackError;
      }
    }
  }

  private async renderPdf(html: string): Promise<Buffer> {
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();
      page.setDefaultTimeout(120_000);
      page.setDefaultNavigationTimeout(120_000);

      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 120_000,
      });

      const pdf = await page.pdf({
        width: '4in',
        height: '6in',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      return Buffer.from(pdf);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown PDF render error';
      this.logger.error(
        `Failed to generate shipping label PDF: ${message}`,
        error,
      );
      throw new BadRequestException(
        `Unable to generate shipping labels PDF: ${message}`,
      );
    } finally {
      await browser?.close();
    }
  }
}
