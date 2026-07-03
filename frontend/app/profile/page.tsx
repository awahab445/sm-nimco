'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi, CustomerProfile, UpdateCustomerProfileDto, ApiError } from '@/lib/api-client';
import { storefrontUi } from '@/lib/storefront-ui';

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<UpdateCustomerProfileDto>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerApi.getProfile();
        setProfile(data);
        setFormData({
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          router.push('/login');
        } else {
          setError(err.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await customerApi.updateProfile(formData);
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
      } else {
        setError(err.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-brand-secondary border-t-brand-primary" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-brand-text">My Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-md border border-brand-secondary/50 bg-brand-secondary/25 p-4">
          <p className="text-sm font-medium text-brand-accent">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md border border-destructive/25 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={storefrontUi.label}>Customer Group</label>
          <div className="mt-1">
            <p className="text-brand-text">
              {profile.customerGroup?.name || 'N/A'}
              {profile.customerGroup?.discountPercent && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({profile.customerGroup.discountPercent}% discount)
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This is assigned by the system and cannot be changed
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="mb-4 text-lg font-medium text-brand-text">Personal Information</h2>

          <div className="mb-4">
            <label htmlFor="firstName" className={storefrontUi.label}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={storefrontUi.inputMt}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className={storefrontUi.label}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={storefrontUi.inputMt}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className={storefrontUi.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={storefrontUi.inputMt}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className={storefrontUi.label}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={storefrontUi.inputMt}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className={storefrontUi.btnNeutral}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={storefrontUi.btnPrimary}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </>
  );
}
