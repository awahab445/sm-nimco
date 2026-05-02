'use client';

import { useState, useEffect } from 'react';
import { Address } from '@/lib/api-client';

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
      country: '',
      phone: '',
    },
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const validateAddress = (addr: Address): boolean => {
    return !!(
      addr.firstName &&
      addr.lastName &&
      addr.addressLine1 &&
      addr.city &&
      addr.state &&
      addr.postalCode &&
      addr.country
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
      await onSubmit(formData);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save address');
    }
  };

  const updateField = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="label" className="block text-sm font-medium mb-1">
            Label (optional)
          </label>
          <input
            id="label"
            type="text"
            placeholder="e.g. Home, Office"
            value={formData.label || ''}
            onChange={(e) => updateField('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Company (optional)
          </label>
          <input
            id="company"
            type="text"
            value={formData.company || ''}
            onChange={(e) => updateField('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
            Address Line 1 *
          </label>
          <input
            id="addressLine1"
            type="text"
            required
            value={formData.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
            Address Line 2 (optional)
          </label>
          <input
            id="addressLine2"
            type="text"
            value={formData.addressLine2 || ''}
            onChange={(e) => updateField('addressLine2', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            City *
          </label>
          <input
            id="city"
            type="text"
            required
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State/Province *
          </label>
          <input
            id="state"
            type="text"
            required
            value={formData.state}
            onChange={(e) => updateField('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
            Postal Code *
          </label>
          <input
            id="postalCode"
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country *
          </label>
          <input
            id="country"
            type="text"
            required
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {formError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

