'use client';

import { useState, useEffect } from 'react';
import { useCheckout } from '@/lib/checkout-context';
import { Address, shippingApi } from '@/lib/api-client';
import { PAKISTAN_PROVINCES } from '@/lib/constants/locations';
import { storefrontUi } from '@/lib/storefront-ui';

type CityOption = { id: string; name: string };

interface AddressStepProps {
  onNext: () => void;
}

export function AddressStep({ onNext }: AddressStepProps) {
  const { checkout, updateAddresses, isLoading, error } = useCheckout();
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>(
    checkout?.billingAddress || {
      firstName: '',
      lastName: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'PK',
    },
  );
  const [shippingAddress, setShippingAddress] = useState<Address>(
    checkout?.shippingAddress || {
      firstName: '',
      lastName: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'PK',
    },
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [apiProvinces, setApiProvinces] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<CityOption[]>([]);

  useEffect(() => {
    shippingApi.getProvinces().then(setApiProvinces).catch(() => {});
    shippingApi
      .getCities()
      .then((cities) => setAllCities(cities.map((city) => ({ id: city.id, name: city.name }))))
      .catch(() => setAllCities([]));
  }, []);

  const validateAddress = (addr: Address): boolean => {
    const country = addr.country?.trim() || 'PK';
    const phone = addr.phone?.trim() || '';
    if (phone.length < 10) return false;
    return !!(
      addr.firstName &&
      addr.lastName &&
      addr.addressLine1 &&
      addr.city &&
      addr.state &&
      country
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const billingWithCountry = { ...billingAddress, country: 'PK' };
    const shippingWithCountry = {
      ...(useSameAddress ? billingWithCountry : shippingAddress),
      country: 'PK',
    };

    if (!validateAddress(billingWithCountry)) {
      const phone = billingWithCountry.phone?.trim() || '';
      if (phone.length < 10) {
        setFormError('Mobile number is required (at least 10 digits)');
      } else {
        setFormError('Please fill in all required billing address fields');
      }
      return;
    }

    if (!validateAddress(shippingWithCountry)) {
      setFormError('Please fill in all required shipping address fields');
      return;
    }

    try {
      await updateAddresses({
        billingAddress: billingWithCountry,
        shippingAddress: shippingWithCountry,
      });
      onNext();
    } catch {
      // Error is handled by context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-foreground">Billing Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="billing-firstName" className={storefrontUi.labelMb}>
              First Name *
            </label>
            <input
              id="billing-firstName"
              type="text"
              required
              value={billingAddress.firstName}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, firstName: e.target.value })
              }
              className={storefrontUi.input}
            />
          </div>
          <div>
            <label htmlFor="billing-lastName" className={storefrontUi.labelMb}>
              Last Name *
            </label>
            <input
              id="billing-lastName"
              type="text"
              required
              value={billingAddress.lastName}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, lastName: e.target.value })
              }
              className={storefrontUi.input}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="billing-company" className={storefrontUi.labelMb}>
              Company (optional)
            </label>
            <input
              id="billing-company"
              type="text"
              value={billingAddress.company || ''}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, company: e.target.value })
              }
              className={storefrontUi.input}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="billing-addressLine1" className={storefrontUi.labelMb}>
              Address Line 1 *
            </label>
            <input
              id="billing-addressLine1"
              type="text"
              required
              value={billingAddress.addressLine1}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, addressLine1: e.target.value })
              }
              className={storefrontUi.input}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="billing-addressLine2" className={storefrontUi.labelMb}>
              Address Line 2 (optional)
            </label>
            <input
              id="billing-addressLine2"
              type="text"
              value={billingAddress.addressLine2 || ''}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, addressLine2: e.target.value })
              }
              className={storefrontUi.input}
            />
          </div>
          <div>
            <label htmlFor="billing-state" className={storefrontUi.labelMb}>
              State/Province *
            </label>
            <select
              id="billing-state"
              required
              value={billingAddress.state}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, state: e.target.value, city: '' })
              }
              className={storefrontUi.select}
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
            <label htmlFor="billing-city" className={storefrontUi.labelMb}>
              City *
            </label>
            <select
              id="billing-city"
              required
              value={billingAddress.city}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, city: e.target.value })
              }
              className={storefrontUi.select}
            >
              <option value="">Select city</option>
              {allCities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="billing-postalCode" className={storefrontUi.labelMb}>
              Postal Code (optional)
            </label>
            <input
              id="billing-postalCode"
              type="text"
              value={billingAddress.postalCode}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, postalCode: e.target.value })
              }
              className={storefrontUi.input}
            />
          </div>
          <div>
            <label htmlFor="billing-country" className={storefrontUi.labelMb}>
              Country *
            </label>
            <input
              id="billing-country"
              type="text"
              readOnly
              value="PK"
              className={`${storefrontUi.input} bg-muted cursor-not-allowed`}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="billing-phone" className={storefrontUi.labelMb}>
              Mobile Number *
            </label>
            <input
              id="billing-phone"
              type="tel"
              required
              minLength={10}
              value={billingAddress.phone || ''}
              onChange={(e) =>
                setBillingAddress({ ...billingAddress, phone: e.target.value })
              }
              className={storefrontUi.input}
              placeholder="03001234567"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="use-same-address"
          type="checkbox"
          checked={useSameAddress}
          onChange={(e) => setUseSameAddress(e.target.checked)}
          className={storefrontUi.checkbox}
        />
        <label htmlFor="use-same-address" className="ml-2 text-sm text-foreground/90">
          Use same address for shipping
        </label>
      </div>

      {!useSameAddress && (
        <div>
          <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-foreground">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipping-firstName" className={storefrontUi.labelMb}>
                First Name *
              </label>
              <input
                id="shipping-firstName"
                type="text"
                required
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                }
                className={storefrontUi.input}
              />
            </div>
            <div>
              <label htmlFor="shipping-lastName" className={storefrontUi.labelMb}>
                Last Name *
              </label>
              <input
                id="shipping-lastName"
                type="text"
                required
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                }
                className={storefrontUi.input}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="shipping-addressLine1" className={storefrontUi.labelMb}>
                Address Line 1 *
              </label>
              <input
                id="shipping-addressLine1"
                type="text"
                required
                value={shippingAddress.addressLine1}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
                }
                className={storefrontUi.input}
              />
            </div>
            <div>
              <label htmlFor="shipping-state" className={storefrontUi.labelMb}>
                State/Province *
              </label>
              <select
                id="shipping-state"
                required
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, state: e.target.value, city: '' })
                }
                className={storefrontUi.select}
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
              <label htmlFor="shipping-city" className={storefrontUi.labelMb}>
                City *
              </label>
              <select
                id="shipping-city"
                required
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                className={storefrontUi.select}
              >
                <option value="">Select city</option>
                {allCities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="shipping-postalCode" className={storefrontUi.labelMb}>
                Postal Code (optional)
              </label>
              <input
                id="shipping-postalCode"
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                }
                className={storefrontUi.input}
              />
            </div>
            <div>
              <label htmlFor="shipping-country" className={storefrontUi.labelMb}>
                Country *
              </label>
              <input
                id="shipping-country"
                type="text"
                readOnly
                value="PK"
                className={`${storefrontUi.input} bg-muted cursor-not-allowed`}
              />
            </div>
          </div>
        </div>
      )}

      {(error || formError) && (
        <div className={storefrontUi.alertError}>
          {error || formError}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`${storefrontUi.btnPrimary} px-6 py-2`}
        >
          {isLoading ? 'Saving...' : 'Continue to Shipping'}
        </button>
      </div>
    </form>
  );
}

