'use client';

import { useEffect, useState } from 'react';
import { AddressService } from '@/lib/address.service';
import { AddressWithId, Address } from '@/lib/api-client';
import { AddressForm } from '@/components/address/address-form';
import { storefrontUi } from '@/lib/storefront-ui';

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
          <p className="text-muted-foreground">Loading...</p>
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
            className={`mb-4 text-sm ${storefrontUi.link}`}
          >
            ← Back to Addresses
          </button>
          <h2 className="text-2xl font-semibold text-brand-text">
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
          <h2 className="text-2xl font-semibold text-brand-text">
            My Addresses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <button
          onClick={handleAdd}
          className={storefrontUi.btnPrimary}
        >
          Add New Address
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className={`p-12 text-center ${storefrontUi.card}`}>
            <p className="mb-4 text-muted-foreground">
              You don't have any saved addresses yet.
            </p>
            <button onClick={handleAdd} className={storefrontUi.btnPrimary}>
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-6 ${storefrontUi.card}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    {address.label && (
                      <p className="mb-0.5 text-sm font-medium text-muted-foreground">
                        {address.label}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold text-brand-text">
                      {address.firstName} {address.lastName}
                    </h3>
                    {address.company && (
                      <p className="text-sm text-muted-foreground">
                        {address.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {address.isDefaultBilling && (
                      <span className={storefrontUi.badgeBrand}>
                        Billing
                      </span>
                    )}
                    {address.isDefaultShipping && (
                      <span className="rounded bg-brand-secondary/55 px-2 py-1 text-xs font-medium text-brand-accent ring-1 ring-inset ring-brand-primary/20">
                        Shipping
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 space-y-1 text-sm text-muted-foreground">
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
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-secondary/25 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    Edit
                  </button>
                  {!address.isDefaultBilling && (
                    <button
                      onClick={() => handleSetDefaultBilling(address.id)}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-secondary/25 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                      Set Billing
                    </button>
                  )}
                  {!address.isDefaultShipping && (
                    <button
                      onClick={() => handleSetDefaultShipping(address.id)}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-secondary/25 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                      Set Shipping
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="rounded-md border border-destructive/40 bg-card px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/30"
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

