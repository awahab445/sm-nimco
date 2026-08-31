import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { DEFAULT_ZONE_CONFIG } from '../config/default-zone-config';
import {
  NationwideShippingMethodConfig,
  ShippingWeightRule,
  ZoneConfigJson,
  ZoneConfigMethodCode,
} from '../config/zone-config.types';

@Injectable()
export class ZoneConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getZoneConfig(): Promise<ZoneConfigJson> {
    const row = await this.prisma.storeSettings.findUnique({
      where: { id: 'default' },
      select: { shippingZoneConfig: true },
    });
    return this.normalizeConfig(row?.shippingZoneConfig);
  }

  async updateZoneConfig(dto: ZoneConfigJson): Promise<ZoneConfigJson> {
    const normalized = this.normalizeConfig(dto);
    await this.prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: { shippingZoneConfig: normalized as object },
      create: {
        id: 'default',
        shippingZoneConfig: normalized as object,
      },
    });
    return normalized;
  }

  private normalizeConfig(raw: unknown): ZoneConfigJson {
    const parsed = this.parseRaw(raw);
    return {
      economy_shipping: this.normalizeEconomyMethod(
        parsed.economy_shipping,
        DEFAULT_ZONE_CONFIG.economy_shipping,
      ),
      overland_shipping: this.normalizeMethod(
        parsed.overland_shipping,
        DEFAULT_ZONE_CONFIG.overland_shipping,
      ),
    };
  }

  /** Economy overflow tier uses baseCost + includedKg + costPerExtraKg — keep in sync with flat tier. */
  private normalizeEconomyMethod(
    raw: NationwideShippingMethodConfig | undefined,
    fallback: NationwideShippingMethodConfig,
  ): NationwideShippingMethodConfig {
    const method = this.normalizeMethod(raw, fallback);
    return {
      ...method,
      rules: this.alignEconomyOverflowRule(method.rules),
    };
  }

  private alignEconomyOverflowRule(
    rules: ShippingWeightRule[],
  ): ShippingWeightRule[] {
    const flatRule = rules.find(
      (r) => r.maxBillableKg != null && r.cost != null,
    );
    const overflowIdx = rules.findIndex(
      (r) =>
        r.maxBillableKg == null &&
        r.baseCost != null &&
        r.costPerExtraKg != null,
    );
    if (!flatRule || overflowIdx < 0) {
      return rules;
    }

    const overflow = rules[overflowIdx];
    const next = [...rules];
    next[overflowIdx] = {
      ...overflow,
      baseCost: flatRule.cost,
      includedKg: flatRule.maxBillableKg ?? overflow.includedKg,
      costPerExtraKg: overflow.costPerExtraKg,
    };
    return next;
  }

  private parseRaw(raw: unknown): Partial<ZoneConfigJson> {
    if (raw == null) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Partial<ZoneConfigJson>;
      } catch {
        return {};
      }
    }
    if (typeof raw === 'object') {
      return raw as Partial<ZoneConfigJson>;
    }
    return {};
  }

  private normalizeMethod(
    raw: NationwideShippingMethodConfig | undefined,
    fallback: NationwideShippingMethodConfig,
  ): NationwideShippingMethodConfig {
    const source = raw ?? fallback;
    const rules = this.normalizeRules(source.rules, fallback.rules);
    if (rules.length === 0) {
      throw new BadRequestException(
        'Each shipping method requires at least one weight rule.',
      );
    }

    return {
      name: (source.name ?? fallback.name).trim() || fallback.name,
      description: source.description?.trim() || fallback.description,
      estimatedDays:
        source.estimatedDays != null && Number.isFinite(source.estimatedDays)
          ? Math.max(0, Math.round(source.estimatedDays))
          : fallback.estimatedDays,
      minBillableKg:
        source.minBillableKg != null && Number.isFinite(source.minBillableKg)
          ? Math.max(1, source.minBillableKg)
          : (fallback.minBillableKg ?? 1),
      rules,
    };
  }

  private normalizeRules(
    raw: ShippingWeightRule[] | undefined,
    fallback: ShippingWeightRule[],
  ): ShippingWeightRule[] {
    const list = Array.isArray(raw) && raw.length > 0 ? raw : fallback;
    return list.map((rule) => ({
      maxBillableKg:
        rule.maxBillableKg == null
          ? null
          : Number.isFinite(rule.maxBillableKg)
            ? Math.max(1, rule.maxBillableKg)
            : null,
      cost:
        rule.cost != null && Number.isFinite(rule.cost)
          ? Math.max(0, rule.cost)
          : undefined,
      costPerKg:
        rule.costPerKg != null && Number.isFinite(rule.costPerKg)
          ? Math.max(0, rule.costPerKg)
          : undefined,
      baseCost:
        rule.baseCost != null && Number.isFinite(rule.baseCost)
          ? Math.max(0, rule.baseCost)
          : undefined,
      includedKg:
        rule.includedKg != null && Number.isFinite(rule.includedKg)
          ? Math.max(0, rule.includedKg)
          : undefined,
      costPerExtraKg:
        rule.costPerExtraKg != null && Number.isFinite(rule.costPerExtraKg)
          ? Math.max(0, rule.costPerExtraKg)
          : undefined,
    }));
  }

  /** Stable method codes for storefront + checkout. */
  methodCodes(): ZoneConfigMethodCode[] {
    return ['economy_shipping', 'overland_shipping'];
  }
}
