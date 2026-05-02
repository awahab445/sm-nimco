'use client';

import { useEffect, useState } from 'react';
import { AddressService } from '@/lib/address.service';
import { AddressWithId, Address } from '@/lib/api-client';
import { AddressForm } from '@/components/address/address-form';

type ViewMode = 'list' | 'add' | 'edit';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingAddress, setEditingAddress] = useState<AddressWithId | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AddressService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setViewMode('add');
  };

  const handleEdit = (address: AddressWithId) => {
    setEditingAddress(address);
    setViewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await AddressService.deleteAddress(id);
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultBilling = async (id: string) => {
    try {
      await AddressService.setDefaultBilling(id);
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to set default billing address');
    }
  };

  const handleSetDefaultShipping = async (id: string) => {
    try {
      await AddressService.setDefaultShipping(id);
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to set default shipping address');
    }
  };

  const handleSubmit = async (address: Address) => {
    try {
      setSubmitting(true);
      setError(null);

      if (editingAddress) {
        await AddressService.updateAddress(editingAddress.id, address);
      } else {
        await AddressService.createAddress(address);
      }

      setViewMode('list');
      setEditingAddress(null);
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingAddress(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <>
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="mb-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Addresses
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">
            {viewMode === 'add' ? 'Add New Address' : 'Edit Address'}
          </h2>
        </div>

        <AddressForm
          address={editingAddress || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={submitting}
          submitLabel={viewMode === 'add' ? 'Add Address' : 'Update Address'}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">
            My Addresses
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
            Manage your shipping and billing addresses
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Address
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-4 text-gray-600 dark:text-zinc-400">
              You don't have any saved addresses yet.
            </p>
            <button
              onClick={handleAdd}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    {address.label && (
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-0.5">
                        {address.label}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                      {address.firstName} {address.lastName}
                    </h3>
                    {address.company && (
                      <p className="text-sm text-gray-600 dark:text-zinc-400">
                        {address.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {address.isDefaultBilling && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Billing
                      </span>
                    )}
                    {address.isDefaultShipping && (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Shipping
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 space-y-1 text-sm text-gray-600 dark:text-zinc-400">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && <p>Phone: {address.phone}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Edit
                  </button>
                  {!address.isDefaultBilling && (
                    <button
                      onClick={() => handleSetDefaultBilling(address.id)}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                    >
                      Set Billing
                    </button>
                  )}
                  {!address.isDefaultShipping && (
                    <button
                      onClick={() => handleSetDefaultShipping(address.id)}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                    >
                      Set Shipping
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-600 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}

