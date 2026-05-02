import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { StripeProvider } from '../providers/stripe.provider';
import { EasyPaisaProvider } from '../providers/easypaisa.provider';
import { JazzCashProvider } from '../providers/jazzcash.provider';
import { HblProvider } from '../providers/bank/hbl.provider';
import { UblProvider } from '../providers/bank/ubl.provider';
import { OfflineCODProvider } from '../providers/offline-cod.provider';
import { PaymentProviderCode } from '../types/payment.types';

@Injectable()
export class PaymentFactory {
  private readonly logger = new Logger(PaymentFactory.name);
  private readonly providers: Map<string, PaymentProvider> = new Map();

  constructor(
    private readonly stripeProvider: StripeProvider,
    private readonly easypaisaProvider: EasyPaisaProvider,
    private readonly jazzcashProvider: JazzCashProvider,
    private readonly hblProvider: HblProvider,
    private readonly ublProvider: UblProvider,
    private readonly codProvider: OfflineCODProvider,
  ) {
    // Register all providers
    this.providers.set(PaymentProviderCode.STRIPE, this.stripeProvider);
    this.providers.set(PaymentProviderCode.EASYPAISA, this.easypaisaProvider);
    this.providers.set(PaymentProviderCode.JAZZCASH, this.jazzcashProvider);
    this.providers.set(PaymentProviderCode.HBL, this.hblProvider);
    this.providers.set(PaymentProviderCode.UBL, this.ublProvider);
    this.providers.set(PaymentProviderCode.COD, this.codProvider);
  }

  /**
   * Get payment provider by code
   */
  getProvider(providerCode: string): PaymentProvider {
    const provider = this.providers.get(providerCode.toLowerCase());

    if (!provider) {
      this.logger.error(`Payment provider not found: ${providerCode}`);
      throw new NotFoundException(`Payment provider '${providerCode}' is not supported`);
    }

    return provider;
  }

  /**
   * Get all registered provider codes
   */
  getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

