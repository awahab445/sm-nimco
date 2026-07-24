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
  phone?: string;
};

type PackageInsertViewModel = {
  storeName: string;
  customerName: string;
  orderNumber: string;
  supportPhone: string;
  storeUrl: string;
};

@Injectable()
export class PackageInsertService {
  private readonly logger = new Logger(PackageInsertService.name);
  private readonly compiledTemplate: HandlebarsTemplateDelegate;
  private readonly logoBase64: string;

  constructor(private readonly prisma: PrismaService) {
    const templatePath = this.resolveTemplatePath('package-insert.hbs');
    const source = readFileSync(templatePath, 'utf8');
    this.compiledTemplate = Handlebars.compile(source);
    this.logoBase64 = this.loadBundledLogoBase64();
  }

  async generateBulkInserts(orderIds: string[]): Promise<Buffer> {
    const uniqueIds = [
      ...new Set(orderIds.map((id) => id.trim()).filter(Boolean)),
    ];
    if (uniqueIds.length === 0) {
      throw new BadRequestException('At least one order ID is required.');
    }

    const orders = await this.prisma.order.findMany({
      where: { id: { in: uniqueIds } },
      orderBy: { createdAt: 'asc' },
    });

    if (orders.length !== uniqueIds.length) {
      const found = new Set(orders.map((order) => order.id));
      const missing = uniqueIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Orders not found: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`,
      );
    }

    const storeName = process.env.STORE_NAME?.trim() || 'SM NIMCO & Sweets';
    const supportPhone =
      process.env.STORE_SUPPORT_PHONE?.trim() || '021-32345678';
    const storeUrl =
      process.env.PUBLIC_BASE_URL?.trim() || 'www.messachemicals.com';

    const orderById = new Map(orders.map((order) => [order.id, order]));
    const inserts: PackageInsertViewModel[] = [];

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
        'Valued Customer';

      inserts.push({
        storeName,
        customerName,
        orderNumber: order.orderNumber,
        supportPhone,
        storeUrl,
      });
    }

    const html = this.compiledTemplate({
      inserts,
      logoBase64: this.logoBase64,
    });

    return this.renderPdf(html);
  }

  private resolveTemplatePath(filename: string): string {
    const candidates = [
      join(__dirname, '..', 'templates', filename),
      join(process.cwd(), 'dist', 'order', 'templates', filename),
      join(process.cwd(), 'src', 'order', 'templates', filename),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    throw new Error(`${filename} template not found`);
  }

  private parseAddress(value: Prisma.JsonValue): AddressSnapshot {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as AddressSnapshot;
  }

  private loadBundledLogoBase64(): string {
    const logoPath = this.resolveBundledLogoPath();
    if (!logoPath) {
      return '';
    }

    const base64 = readFileSync(logoPath, 'base64');
    if (!base64?.trim()) {
      return '';
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
      return await puppeteer.launch(baseOptions);
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

      await page.evaluate(async () => {
        await document.fonts.ready;
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
        `Failed to generate package insert PDF: ${message}`,
        error,
      );
      throw new BadRequestException(
        `Unable to generate package insert PDF: ${message}`,
      );
    } finally {
      await browser?.close();
    }
  }
}
