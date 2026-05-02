'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi, CustomerProfile, UpdateCustomerProfileDto, ApiError } from '@/lib/api-client';

export default function ProfilePage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<UpdateCustomerProfileDto>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Load profile on mount
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading profile...</p>
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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">
          My Profile
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Manage your account information and preferences
        </p>
      </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Profile updated successfully!
            </p>
          </div>
        )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Profile updated successfully!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Group (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Customer Group
              </label>
              <div className="mt-1">
                <p className="text-gray-900 dark:text-zinc-50">
                  {profile.customerGroup?.name || 'N/A'}
                  {profile.customerGroup?.discountPercent && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-zinc-400">
                      ({profile.customerGroup.discountPercent}% discount)
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  This is assigned by the system and cannot be changed
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-4">
                Personal Information
              </h2>

              {/* First Name */}
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                />
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 border-t border-gray-200 dark:border-zinc-700 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
    </>
  );
}

