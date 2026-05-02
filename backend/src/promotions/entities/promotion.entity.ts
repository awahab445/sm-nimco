import { PromotionType, PromotionScope, PromotionConditions } from '../dto/create-promotion.dto';

export interface Promotion {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  type: PromotionType;
  status: 'draft' | 'active' | 'expired' | 'disabled';
  discountValue: number | null;
  discountType: 'percentage' | 'fixed_amount' | null;
  scope: PromotionScope;
  isStackable: boolean;
  isExclusive: boolean;
  appliesToAllGroups: boolean;
  conditions: PromotionConditions;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  currentUsage: number;
  startDate: Date | null;
  endDate: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionProduct {
  id: string;
  promotionId: string;
  productId: string | null;
  variantId: string | null;
  categoryId: string | null;
}

export interface PromotionCustomerGroup {
  id: string;
  promotionId: string;
  customerGroupId: string;
  isExcluded: boolean;
}

export interface PromotionLog {
  id: string;
  promotionId: string;
  cartId: string | null;
  checkoutId: string | null;
  orderId: string | null;
  customerId: string | null;
  couponCode: string | null;
  discountAmount: number;
  subtotalBefore: number;
  subtotalAfter: number;
  status: 'applied' | 'expired' | 'failed';
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface AppliedPromotion {
  promotionId: string;
  promotionCode: string | null;
  discountAmount: number;
  promotion: Promotion;
}

