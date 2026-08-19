export interface ShippingZone {
  id: string;
  name: string;
  description: string | null;
  coverage: ZoneCoverage;
  priority: number;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneCoverage {
  countries?: string[];
  regions?: string[];
  cities?: string[];
}

export interface ShippingMethod {
  id: string;
  zoneId: string;
  code: string;
  name: string;
  description: string | null;
  type: ShippingMethodType;
  config: ShippingMethodConfig;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  minWeight: number | null;
  maxWeight: number | null;
  priority: number;
  isActive: boolean;
  courierConfig: Record<string, any> | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  customerGroups?: ShippingMethodCustomerGroup[];
}

export interface ShippingMethodCustomerGroup {
  id: string;
  shippingMethodId: string;
  customerGroupId: string;
  discountPercent: number | null;
  fixedCost: number | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type ShippingMethodType =
  | 'flat_rate'
  | 'weight_based'
  | 'amount_based'
  | 'courier_api';

export interface ShippingMethodConfig {
  // For flat_rate
  cost?: number;

  // For weight_based
  baseCost?: number;
  costPerKg?: number;
  /** Included kilograms covered by baseCost (e.g. 3 for economy, 5 for overland). */
  baseCostKgLimit?: number;
  minWeight?: number;
  maxWeight?: number;

  // For amount_based
  freeAbove?: number;
  costBelow?: number;

  // For courier_api
  provider?: string;
  serviceType?: string;
}

export interface OrderShipping {
  id: string;
  orderId: string;
  shippingMethodId: string;
  cost: number;
  currency: string;
  status: ShippingStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  courierCode: string | null;
  courierName: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  shippingAddress: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type ShippingStatus =
  | 'pending'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';
