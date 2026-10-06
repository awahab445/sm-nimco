'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminUi } from '@/lib/admin-ui';
import {
  createManualOrder,
  updateManualOrder,
  isCustomOrderItem,
  type ManualOrderAddressInput,
  type ManualOrderPaymentMethod,
  type Order,
  type OrderAddressSnapshot,
} from '@/lib/api/orders';
import {
  fetchAdminProduct,
  fetchAdminProducts,
  type AdminProductListRow,
} from '@/lib/api/products';
import { formatApiError } from '@/lib/api/error-message';
import { PermissionGate } from '@/components/permission-gate';

type LineItem = {
  key: string;
  isCustom: boolean;
  productId?: string;
  productName: string;
  productSku: string;
  variantId?: string;
  variantOptions: Array<{ id: string; name: string; price: number }>;
  catalogUnitPrice: number;
  unitPrice: number;
  priceOverrideEnabled: boolean;
  quantity: number;
  /** Unit weight in kg (used for custom items; courier / preview). */
  weightKg: number;
};

type AddressForm = {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyAddress = (): AddressForm => ({
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Pakistan',
});

function addressFromSnapshot(snapshot: OrderAddressSnapshot | null | undefined): AddressForm {
  if (!snapshot || typeof snapshot !== 'object') return emptyAddress();
  return {
    firstName: snapshot.firstName ?? '',
    lastName: snapshot.lastName ?? '',
    phone: snapshot.phone ?? '',
    addressLine1: snapshot.addressLine1 ?? '',
    addressLine2: snapshot.addressLine2 ?? '',
    city: snapshot.city ?? '',
    state: snapshot.state ?? '',
    postalCode: snapshot.postalCode ?? '',
    country: snapshot.country || 'Pakistan',
  };
}

function addressesEqual(a: AddressForm, b: AddressForm): boolean {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.phone === b.phone &&
    a.addressLine1 === b.addressLine1 &&
    a.addressLine2 === b.addressLine2 &&
    a.city === b.city &&
    a.state === b.state &&
    a.postalCode === b.postalCode &&
    a.country === b.country
  );
}

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount: number, currency = 'PKR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Preview of backend calculateShippingFee(city, weight) rules. */
function calculatePreviewShippingFee(city: string, totalWeightKg: number): number {
  const billable = Math.max(1, Math.ceil(Math.max(0, totalWeightKg)));
  const isKarachi = city.trim().toLowerCase() === 'karachi';
  if (isKarachi) {
    if (billable <= 2) return 200;
    if (billable <= 3) return 250;
    return 300;
  }
  if (billable <= 3) return 300;
  return 300 + (billable - 3) * 70;
}

type CityZone = 'karachi' | 'outstation';

function cityZoneFromCity(city: string): CityZone {
  return city.trim().toLowerCase() === 'karachi' ? 'karachi' : 'outstation';
}

function resolveCatalogPrice(row: LineItem): number {
  if (row.isCustom) return row.unitPrice;
  if (row.variantId) {
    const match = row.variantOptions.find((v) => v.id === row.variantId);
    if (match) return match.price;
  }
  return row.catalogUnitPrice;
}

function lineUnitPrice(row: LineItem): number {
  if (row.isCustom) return Math.max(0, row.unitPrice);
  return row.priceOverrideEnabled ? row.unitPrice : resolveCatalogPrice(row);
}

function toAddressDto(form: AddressForm): ManualOrderAddressInput {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    addressLine1: form.addressLine1.trim(),
    ...(form.addressLine2.trim() ? { addressLine2: form.addressLine2.trim() } : {}),
    city: form.city.trim(),
    state: form.state.trim() || form.city.trim() || '—',
    postalCode: form.postalCode.trim() || '00000',
    country: form.country.trim() || 'Pakistan',
    phone: form.phone.trim(),
  };
}

function AddressFields({
  title,
  value,
  onChange,
  cityMode = 'text',
  cityZone,
  onCityZoneChange,
  outstationCity,
  onOutstationCityChange,
}: {
  title: string;
  value: AddressForm;
  onChange: (next: AddressForm) => void;
  cityMode?: 'text' | 'zone';
  cityZone?: CityZone;
  onCityZoneChange?: (zone: CityZone) => void;
  outstationCity?: string;
  onOutstationCityChange?: (city: string) => void;
}) {
  const set =
    (field: keyof AddressForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: e.target.value });

  return (
    <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            First name *
          </label>
          <input
            required
            value={value.firstName}
            onChange={set('firstName')}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Last name *
          </label>
          <input
            required
            value={value.lastName}
            onChange={set('lastName')}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone *</label>
        <input
          required
          value={value.phone}
          onChange={set('phone')}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Address line 1 *
        </label>
        <input
          required
          value={value.addressLine1}
          onChange={set('addressLine1')}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Address line 2
        </label>
        <input
          value={value.addressLine2}
          onChange={set('addressLine2')}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">City *</label>
          {cityMode === 'zone' ? (
            <div className="mt-1 space-y-2">
              <select
                required
                value={cityZone ?? 'karachi'}
                onChange={(e) => onCityZoneChange?.(e.target.value as CityZone)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              >
                <option value="karachi">Karachi</option>
                <option value="outstation">Outstation</option>
              </select>
              {cityZone === 'outstation' ? (
                <input
                  required
                  value={outstationCity ?? ''}
                  onChange={(e) => onOutstationCityChange?.(e.target.value)}
                  placeholder="City name (e.g. Lahore)"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              ) : null}
            </div>
          ) : (
            <input
              required
              value={value.city}
              onChange={set('city')}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">State</label>
          <input
            value={value.state}
            onChange={set('state')}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Postal code
          </label>
          <input
            value={value.postalCode}
            onChange={set('postalCode')}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Country *</label>
        <input
          required
          value={value.country}
          onChange={set('country')}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>
    </fieldset>
  );
}

type ManualOrderFormProps = {
  /** When set, the form edits this order instead of creating a new one. */
  editOrder?: Order;
  /** Called after a successful edit (create still navigates to the new order). */
  onUpdated?: (order: Order) => void;
};

export function ManualOrderCreateForm({ editOrder, onUpdated }: ManualOrderFormProps = {}) {
  const router = useRouter();
  const isEdit = Boolean(editOrder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(isEdit);
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  const [customerEmail, setCustomerEmail] = useState(editOrder?.customerEmail ?? '');
  const [customerName, setCustomerName] = useState(editOrder?.customerName ?? '');
  const [notes, setNotes] = useState(editOrder?.notes ?? '');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(() => {
    if (editOrder) return addressFromSnapshot(editOrder.shippingAddress);
    return { ...emptyAddress(), city: 'Karachi' };
  });
  const [billingAddress, setBillingAddress] = useState<AddressForm>(() =>
    editOrder ? addressFromSnapshot(editOrder.billingAddress) : emptyAddress(),
  );
  const [cityZone, setCityZone] = useState<CityZone>(() =>
    cityZoneFromCity(
      editOrder?.shippingAddress?.city ?? 'Karachi',
    ),
  );
  const [outstationCity, setOutstationCity] = useState(() => {
    const city = editOrder?.shippingAddress?.city?.trim() ?? '';
    return city && city.toLowerCase() !== 'karachi' ? city : '';
  });
  const initialPayment =
    editOrder?.metadata?.paymentMethod === 'bank_transfer'
      ? 'bank_transfer'
      : 'cod';
  const [paymentMethod, setPaymentMethod] =
    useState<ManualOrderPaymentMethod>(initialPayment);
  const [sendWhatsappConfirmation, setSendWhatsappConfirmation] = useState(true);

  const [items, setItems] = useState<LineItem[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<AdminProductListRow[]>([]);
  const [searching, setSearching] = useState(false);

  const overrides =
    editOrder?.metadata?.overrides &&
    typeof editOrder.metadata.overrides === 'object' &&
    !Array.isArray(editOrder.metadata.overrides)
      ? (editOrder.metadata.overrides as Record<string, unknown>)
      : null;

  const initialDelivery =
    overrides && typeof overrides.customDeliveryFee === 'number'
      ? String(overrides.customDeliveryFee)
      : editOrder
        ? String(Number(editOrder.shippingTotal) || 0)
        : '0';
  const initialDiscount =
    overrides && typeof overrides.customDiscount === 'number'
      ? String(overrides.customDiscount)
      : editOrder
        ? String(Number(editOrder.discountTotal) || 0)
        : '0';

  const [overrideDelivery, setOverrideDelivery] = useState(
    Boolean(
      overrides &&
        overrides.customDeliveryFee !== null &&
        overrides.customDeliveryFee !== undefined,
    ),
  );
  const [deliveryFee, setDeliveryFee] = useState(initialDelivery);
  const [discount, setDiscount] = useState(initialDiscount);

  function applyCityZone(zone: CityZone, outstationName = outstationCity) {
    setCityZone(zone);
    if (zone === 'karachi') {
      setShippingAddress((prev) => ({ ...prev, city: 'Karachi' }));
    } else {
      const city = outstationName.trim() || 'Outstation';
      setShippingAddress((prev) => ({ ...prev, city }));
    }
  }

  useEffect(() => {
    if (!editOrder) {
      setHydrating(false);
      return;
    }

    let cancelled = false;

    async function hydrateFromOrder(order: Order) {
      setHydrating(true);
      setHydrateError(null);
      try {
        const shipping = addressFromSnapshot(order.shippingAddress);
        const billing = addressFromSnapshot(order.billingAddress);
        if (!cancelled) {
          setCustomerEmail(order.customerEmail ?? '');
          setCustomerName(order.customerName ?? '');
          setNotes(order.notes ?? '');
          setShippingAddress(shipping);
          setBillingAddress(billing);
          setSameAsShipping(addressesEqual(shipping, billing));
          setCityZone(cityZoneFromCity(shipping.city));
          setOutstationCity(
            shipping.city.trim().toLowerCase() === 'karachi'
              ? ''
              : shipping.city.trim(),
          );
          setPaymentMethod(
            order.metadata?.paymentMethod === 'bank_transfer'
              ? 'bank_transfer'
              : 'cod',
          );
        }

        const productIds = [
          ...new Set(
            order.items
              .filter((i) => !isCustomOrderItem(i))
              .map((i) => i.productId)
              .filter(Boolean),
          ),
        ];
        const productDetails = await Promise.all(
          productIds.map(async (pid) => {
            try {
              return await fetchAdminProduct(pid);
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;

        const productById = new Map(
          productDetails.filter(Boolean).map((p) => [p!.id, p!]),
        );

        const lineItems: LineItem[] = order.items.map((item, index) => {
          const meta =
            item.metadata && typeof item.metadata === 'object'
              ? (item.metadata as Record<string, unknown>)
              : {};
          const custom = isCustomOrderItem(item);
          const weightFromMeta =
            typeof meta.weightKg === 'number'
              ? meta.weightKg
              : typeof meta.weightKg === 'string'
                ? Number(meta.weightKg)
                : typeof meta.weight === 'number'
                  ? meta.weight
                  : typeof meta.weight === 'string'
                    ? Number(meta.weight)
                    : 1;

          if (custom) {
            const unitPrice = Number(item.unitPrice) || 0;
            return {
              key: `${item.id || 'custom'}-${index}`,
              isCustom: true,
              productName: item.name || 'Custom item',
              productSku: item.sku || 'CUSTOM',
              variantOptions: [],
              catalogUnitPrice: unitPrice,
              unitPrice,
              priceOverrideEnabled: true,
              quantity: Math.max(1, item.quantity || 1),
              weightKg:
                Number.isFinite(weightFromMeta) && weightFromMeta >= 0
                  ? weightFromMeta
                  : 1,
            };
          }

          const product = productById.get(item.productId);
          const variants = (product?.variants ?? []).filter((v) => v.isActive);
          const catalogBase = Number(product?.basePrice) || Number(item.unitPrice) || 0;
          const variantOptions = variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: Number(v.price) || catalogBase,
          }));
          const variantId = item.variantId ?? undefined;
          const catalogFromVariant = variantId
            ? variantOptions.find((v) => v.id === variantId)?.price
            : undefined;
          const originalUnitPrice =
            typeof meta.originalUnitPrice === 'number'
              ? meta.originalUnitPrice
              : typeof meta.originalUnitPrice === 'string'
                ? Number(meta.originalUnitPrice)
                : null;
          const catalogUnitPrice =
            catalogFromVariant ??
            (originalUnitPrice != null && Number.isFinite(originalUnitPrice)
              ? originalUnitPrice
              : catalogBase);
          const unitPrice = Number(item.unitPrice) || catalogUnitPrice;
          const priceOverridden =
            meta.priceOverridden === true ||
            (Number.isFinite(unitPrice) &&
              Number.isFinite(catalogUnitPrice) &&
              Math.abs(unitPrice - catalogUnitPrice) > 0.001);

          return {
            key: `${item.id || item.productId}-${index}`,
            isCustom: false,
            productId: item.productId,
            productName:
              (typeof meta.productName === 'string' && meta.productName) ||
              product?.name ||
              item.name,
            productSku: item.sku || product?.sku || '',
            variantId,
            variantOptions,
            catalogUnitPrice,
            unitPrice,
            priceOverrideEnabled: priceOverridden,
            quantity: Math.max(1, item.quantity || 1),
            weightKg: 1,
          };
        });

        if (!cancelled) {
          setItems(lineItems);
        }
      } catch (e) {
        if (!cancelled) {
          setHydrateError(formatApiError(e));
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    void hydrateFromOrder(editOrder);
    return () => {
      cancelled = true;
    };
  }, [editOrder]);

  useEffect(() => {
    const q = search.trim();
    const timer = window.setTimeout(async () => {
      if (q.length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const res = await fetchAdminProducts({
          search: q,
          limit: 12,
          status: 'active',
        });
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, q.length < 2 ? 0 : 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + lineUnitPrice(item) * Math.max(1, item.quantity || 1);
    }, 0);
    const totalWeightKg = items.reduce((sum, item) => {
      const unit = item.isCustom
        ? Math.max(0, Number(item.weightKg) || 0)
        : Math.max(0, Number(item.weightKg) || 1);
      return sum + unit * Math.max(1, item.quantity || 1);
    }, 0);
    const feeCity =
      cityZone === 'karachi'
        ? 'Karachi'
        : outstationCity.trim() || shippingAddress.city || 'Outstation';
    const calculatedShipping = calculatePreviewShippingFee(feeCity, totalWeightKg);
    const shipping = overrideDelivery
      ? Math.max(0, toNumber(deliveryFee))
      : calculatedShipping;
    const discountTotal = Math.min(Math.max(0, toNumber(discount)), subtotal);
    const grandTotal = Math.max(0, subtotal - discountTotal + shipping);
    return {
      subtotal,
      shipping,
      calculatedShipping,
      discountTotal,
      grandTotal,
      totalWeightKg,
    };
  }, [
    items,
    overrideDelivery,
    deliveryFee,
    discount,
    cityZone,
    outstationCity,
    shippingAddress.city,
  ]);

  function addCustomItem() {
    setItems((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        isCustom: true,
        productName: '',
        productSku: 'CUSTOM',
        variantOptions: [],
        catalogUnitPrice: 0,
        unitPrice: 0,
        priceOverrideEnabled: true,
        quantity: 1,
        weightKg: 1,
      },
    ]);
  }

  async function addProduct(product: AdminProductListRow) {
    try {
      const detail = await fetchAdminProduct(product.id);
      const variants = (detail.variants ?? []).filter((v) => v.isActive);
      const catalogUnitPrice = Number(detail.basePrice) || 0;
      const variantOptions = variants.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price) || catalogUnitPrice,
      }));
      const defaultVariant = variantOptions[0];
      const unitPrice = defaultVariant?.price ?? catalogUnitPrice;
      const shippingWeight = Number(detail.shippingWeight);
      const weightKg =
        Number.isFinite(shippingWeight) && shippingWeight > 0 ? shippingWeight : 1;

      setItems((prev) => [
        ...prev,
        {
          key: `${product.id}-${Date.now()}`,
          isCustom: false,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          variantId: defaultVariant?.id,
          variantOptions,
          catalogUnitPrice,
          unitPrice,
          priceOverrideEnabled: false,
          quantity: 1,
          weightKg,
        },
      ]);
      setSearch('');
      setSearchResults([]);
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        const next = { ...row, ...patch };
        if (patch.variantId && patch.variantId !== row.variantId) {
          const match = next.variantOptions.find((v) => v.id === patch.variantId);
          if (match) {
            next.catalogUnitPrice = match.price;
            if (!next.priceOverrideEnabled) next.unitPrice = match.price;
          }
        }
        if (patch.priceOverrideEnabled === true && !row.priceOverrideEnabled) {
          next.unitPrice = resolveCatalogPrice(next);
        }
        return next;
      }),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Add at least one product or custom item.');
      return;
    }
    for (const item of items) {
      if (item.isCustom && !item.productName.trim()) {
        setError('Custom items require an item name.');
        return;
      }
    }
    if (cityZone === 'outstation' && !outstationCity.trim()) {
      setError('Enter the outstation city name.');
      return;
    }

    const resolvedCity =
      cityZone === 'karachi' ? 'Karachi' : outstationCity.trim();
    const shipping = toAddressDto({
      ...shippingAddress,
      city: resolvedCity,
    });
    const billing = sameAsShipping ? shipping : toAddressDto(billingAddress);

    const nameFromAddress = [shipping.firstName, shipping.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const phoneDigits = shipping.phone.replace(/\D/g, '');
    const resolvedEmail =
      customerEmail.trim() ||
      (phoneDigits
        ? `manual+${phoneDigits}@smnimco.local`
        : 'manual-order@smnimco.local');

    const body = {
      customerEmail: resolvedEmail,
      customerName: customerName.trim() || nameFromAddress || undefined,
      customerId: editOrder?.customerId ?? undefined,
      customerGroupId: editOrder?.customerGroupId ?? undefined,
      notes: notes.trim() || undefined,
      shippingAddress: shipping,
      billingAddress: billing,
      currency: editOrder?.currency,
      paymentMethod,
      sendWhatsappConfirmation,
      ...(overrideDelivery
        ? { customDeliveryFee: Math.max(0, toNumber(deliveryFee)) }
        : {}),
      ...(toNumber(discount) > 0
        ? { customDiscount: Math.max(0, toNumber(discount)) }
        : isEdit
          ? { customDiscount: 0 }
          : {}),
      items: items.map((item) => {
        if (item.isCustom) {
          return {
            isCustom: true,
            title: item.productName.trim(),
            unitPrice: Math.max(0, item.unitPrice),
            quantity: Math.max(1, Math.floor(item.quantity) || 1),
            weight: Math.max(0, Number(item.weightKg) || 0),
          };
        }
        const catalog = resolveCatalogPrice(item);
        const charged = item.priceOverrideEnabled ? item.unitPrice : catalog;
        return {
          productId: item.productId as string,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          quantity: Math.max(1, Math.floor(item.quantity) || 1),
          ...(item.priceOverrideEnabled
            ? { customUnitPrice: Math.max(0, charged) }
            : {}),
        };
      }),
    };

    setSaving(true);
    try {
      if (isEdit && editOrder) {
        const order = await updateManualOrder(editOrder.id, body);
        onUpdated?.(order);
        router.push(`/orders/${order.id}?updated=1`);
        router.refresh();
      } else {
        const order = await createManualOrder(body);
        router.push(`/orders/${order.id}`);
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  const permissionKeys = isEdit
    ? (['orders.update', 'orders.manage'] as const)
    : (['orders.create', 'orders.manage'] as const);

  return (
    <PermissionGate
      anyOf={[...permissionKeys]}
      fallback={
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          You need <code>{isEdit ? 'orders.update' : 'orders.create'}</code>{' '}
          permission to {isEdit ? 'edit' : 'place'} manual orders.
        </p>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div>
          <Link
            href={isEdit && editOrder ? `/orders/${editOrder.id}` : '/orders'}
            className="text-sm text-zinc-600 underline dark:text-zinc-400"
          >
            ← {isEdit ? 'Order detail' : 'Orders'}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {isEdit ? `Edit order ${editOrder?.orderNumber ?? ''}` : 'Manual order'}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {isEdit
              ? 'Update items, quantities, shipping details, and fee overrides. Totals recalculate on save.'
              : 'Create an order for phone / WhatsApp customers with catalog products or custom items. Delivery fee uses Karachi / Outstation weight rules unless overridden.'}
          </p>
        </div>

        {hydrateError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {hydrateError}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        {hydrating ? (
          <p className="text-sm text-zinc-500">Loading order details…</p>
        ) : (
          <>
            <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Customer</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Customer name
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Defaults to shipping name"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Optional; auto from phone if blank"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Payment method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as ManualOrderPaymentMethod)
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={sendWhatsappConfirmation}
                      onChange={(e) => setSendWhatsappConfirmation(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    Generate WhatsApp confirmation payload
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Internal notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Products
                </h2>
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-900 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-950/70"
                >
                  + Add Custom / Unlisted Item
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Search products
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or SKU…"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                {searching ? (
                  <p className="mt-1 text-xs text-zinc-500">Searching…</p>
                ) : null}
                {searchResults.length > 0 ? (
                  <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          onClick={() => void addProduct(p)}
                        >
                          <span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                              {p.name}
                            </span>
                            <span className="ml-2 font-mono text-xs text-zinc-500">{p.sku}</span>
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatMoney(Number(p.basePrice) || 0)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No products or custom items added yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => {
                    if (item.isCustom) {
                      return (
                        <li
                          key={item.key}
                          className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 dark:border-violet-900/60 dark:bg-violet-950/20"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                Custom / Unlisted Item
                              </p>
                              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">
                                Custom Item
                              </span>
                            </div>
                            <button
                              type="button"
                              className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                              onClick={() =>
                                setItems((prev) => prev.filter((row) => row.key !== item.key))
                              }
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Item name *
                              </label>
                              <input
                                required
                                value={item.productName}
                                onChange={(e) =>
                                  updateItem(item.key, { productName: e.target.value })
                                }
                                placeholder="e.g. Custom Special Nimco Mix"
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Price *
                              </label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(item.key, {
                                    unitPrice: Math.max(0, toNumber(e.target.value)),
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Qty
                              </label>
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.key, {
                                    quantity: Math.max(1, Math.floor(Number(e.target.value)) || 1),
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Weight (kg)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.weightKg}
                                onChange={(e) =>
                                  updateItem(item.key, {
                                    weightKg: Math.max(0, toNumber(e.target.value)),
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                              />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-zinc-500">
                            Line total {formatMoney(lineUnitPrice(item) * item.quantity)} ·{' '}
                            {(item.weightKg * item.quantity).toFixed(2)} kg
                          </p>
                        </li>
                      );
                    }

                    const catalog = resolveCatalogPrice(item);
                    return (
                      <li
                        key={item.key}
                        className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-50">
                              {item.productName}
                            </p>
                            <p className="font-mono text-xs text-zinc-500">{item.productSku}</p>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                            onClick={() =>
                              setItems((prev) => prev.filter((row) => row.key !== item.key))
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {item.variantOptions.length > 0 ? (
                            <div>
                              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Variant
                              </label>
                              <select
                                value={item.variantId ?? ''}
                                onChange={(e) =>
                                  updateItem(item.key, { variantId: e.target.value })
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                              >
                                {item.variantOptions.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name} — {formatMoney(v.price)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}

                          <div>
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Qty
                            </label>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.key, {
                                  quantity: Math.max(1, Math.floor(Number(e.target.value)) || 1),
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              <input
                                type="checkbox"
                                checked={item.priceOverrideEnabled}
                                onChange={(e) =>
                                  updateItem(item.key, {
                                    priceOverrideEnabled: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-zinc-300"
                              />
                              Editable unit price
                              <span className="font-normal text-zinc-500">
                                (catalog {formatMoney(catalog)})
                              </span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              disabled={!item.priceOverrideEnabled}
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(item.key, {
                                  unitPrice: Math.max(0, toNumber(e.target.value)),
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:disabled:bg-zinc-900/40"
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <AddressFields
                title="Shipping address"
                value={shippingAddress}
                onChange={setShippingAddress}
                cityMode="zone"
                cityZone={cityZone}
                onCityZoneChange={(zone) => applyCityZone(zone)}
                outstationCity={outstationCity}
                onOutstationCityChange={(city) => {
                  setOutstationCity(city);
                  applyCityZone('outstation', city);
                }}
              />
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Billing same as shipping
                </label>
                {!sameAsShipping ? (
                  <AddressFields
                    title="Billing address"
                    value={billingAddress}
                    onChange={setBillingAddress}
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Shipping &amp; discount
                </h2>
                <p className="text-xs text-zinc-500">
                  Calculated delivery: {formatMoney(summary.calculatedShipping)} (Karachi
                  200/250/300 · Outstation 300 + 70/kg)
                </p>
                <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={overrideDelivery}
                    onChange={(e) => setOverrideDelivery(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Override delivery fee
                </label>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Delivery fee {overrideDelivery ? '*' : '(auto from weight + city)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={!overrideDelivery}
                    value={overrideDelivery ? deliveryFee : String(summary.calculatedShipping)}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:disabled:bg-zinc-900/40"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Leave auto-calculated, or override (use 0 for free delivery).
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Manual adjustment / discount
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Order summary
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-600 dark:text-zinc-400">Subtotal</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatMoney(summary.subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-600 dark:text-zinc-400">Est. weight</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      {summary.totalWeightKg.toFixed(2)} kg
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-600 dark:text-zinc-400">Delivery fee</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatMoney(summary.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-600 dark:text-zinc-400">Discount</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      −{formatMoney(summary.discountTotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                    <dt className="font-semibold text-zinc-900 dark:text-zinc-50">Grand total</dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatMoney(summary.grandTotal)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-zinc-500">
                  Tax (if configured) is calculated on the server from the final unit prices.
                </p>
              </section>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className={adminUi.btnPrimary}>
                {saving
                  ? isEdit
                    ? 'Saving…'
                    : 'Creating…'
                  : isEdit
                    ? 'Save changes'
                    : 'Create order'}
              </button>
              <Link
                href={isEdit && editOrder ? `/orders/${editOrder.id}` : '/orders'}
                className={adminUi.btnSecondary}
              >
                Cancel
              </Link>
            </div>
          </>
        )}
      </form>
    </PermissionGate>
  );
}
