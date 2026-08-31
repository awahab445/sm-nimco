'use client';

import { useState, useEffect } from 'react';
import { Address, shippingApi } from '@/lib/api-client';
import {
  PAKISTAN_PROVINCES,
  getCitySelectOptions,
} from '@/lib/constants/locations';
import { storefrontUi } from '@/lib/storefront-ui';

type CityOption = { id: string; name: string };

interface AddressFormProps {
  address?: Address;
  onSubmit: (address: Address) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AddressForm({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Address',
}: AddressFormProps) {
  const [formData, setFormData] = useState<Address>(
    address || {
      label: '',
      firstName: '',
      lastName: '',
      company: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'PK',
      phone: '',
    },
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [prevAddress, setPrevAddress] = useState(address);

  if (address !== prevAddress) {
    setPrevAddress(address);
    if (address) setFormData(address);
  }

  const [apiProvinces, setApiProvinces] = useState<string[]>([]);
  const [apiCities, setApiCities] = useState<CityOption[]>([]);

  useEffect(() => {
    shippingApi.getProvinces().then(setApiProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    const province = formData.state?.trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on dependency change
    if (!province) { setApiCities([]); return; }
    shippingApi.getCities(province).then(cities => setApiCities(cities.map(c => ({ id: c.id, name: c.name })))).catch(() => setApiCities([]));
  }, [formData.state]);

  const cityOptions = getCitySelectOptions(formData.state, formData.city);
  const cityDisabled = !formData.state;

  const validateAddress = (addr: Address): boolean => {
    return !!(
      addr.firstName?.trim() &&
      addr.lastName?.trim() &&
      addr.addressLine1?.trim() &&
      addr.city?.trim() &&
      addr.state?.trim() &&
      addr.country?.trim() &&
      addr.phone?.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateAddress(formData)) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      await onSubmit({ ...formData, country: formData.country || 'PK' });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const updateField = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (province: string) => {
    setFormData((prev) => ({ ...prev, state: province, city: '' }));
  };

  const fieldInput = storefrontUi.input;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="label" className={storefrontUi.label}>
            Label (optional)
          </label>
          <input
            id="label"
            type="text"
            placeholder="e.g. Home, Office"
            value={formData.label || ''}
            onChange={(e) => updateField('label', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div>
          <label htmlFor="firstName" className={storefrontUi.label}>
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={storefrontUi.label}>
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="company" className={storefrontUi.label}>
            Company (optional)
          </label>
          <input
            id="company"
            type="text"
            value={formData.company || ''}
            onChange={(e) => updateField('company', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addressLine1" className={storefrontUi.label}>
            Address Line 1 *
          </label>
          <input
            id="addressLine1"
            type="text"
            required
            value={formData.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addressLine2" className={storefrontUi.label}>
            Address Line 2 (optional)
          </label>
          <input
            id="addressLine2"
            type="text"
            value={formData.addressLine2 || ''}
            onChange={(e) => updateField('addressLine2', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div>
          <label htmlFor="state" className={storefrontUi.label}>
            State/Province *
          </label>
          <select
            id="state"
            required
            value={formData.state}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={`mt-1 ${storefrontUi.select}`}
          >
            <option value="">Select province</option>
            {(apiProvinces.length > 0 ? apiProvinces : PAKISTAN_PROVINCES).map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className={storefrontUi.label}>
            City *
          </label>
          <select
            id="city"
            required
            disabled={cityDisabled}
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={`mt-1 ${storefrontUi.select} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">
              {cityDisabled ? 'Select Province first' : 'Select city'}
            </option>
            {(apiCities.length > 0 ? apiCities : cityOptions.map(c => ({ id: c, name: c }))).map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="postalCode" className={storefrontUi.label}>
            Postal Code (optional)
          </label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className={`mt-1 ${fieldInput}`}
          />
        </div>
        <div>
          <label htmlFor="country" className={storefrontUi.label}>
            Country *
          </label>
          <input
            id="country"
            type="text"
            readOnly
            value="PK"
            className={`mt-1 ${fieldInput} bg-muted cursor-not-allowed`}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="phone" className={storefrontUi.label}>
            Mobile Number *
          </label>
          <input
            id="phone"
            type="tel"
            required
            minLength={10}
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className={`mt-1 ${fieldInput}`}
            placeholder="03001234567"
          />
        </div>
      </div>

      {formError && (
        <div className={storefrontUi.alertError} role="alert">
          {formError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`${storefrontUi.btnNeutralLg} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`${storefrontUi.btnPrimary} px-6 py-2`}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
