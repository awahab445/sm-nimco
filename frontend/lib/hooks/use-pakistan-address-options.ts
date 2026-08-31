'use client';

import { useEffect, useState } from 'react';
import { shippingApi } from '@/lib/api-client';
import { PAKISTAN_PROVINCES } from '@/lib/constants/locations';

export type CityOption = { id: string; name: string };

type UsePakistanAddressOptionsResult = {
  provinces: readonly string[];
  cities: CityOption[];
  loadingProvinces: boolean;
  loadingCities: boolean;
  provincesError: boolean;
  citiesError: boolean;
};

/**
 * Province/city dropdown data from courier_cities (seeded via cities-data).
 * Falls back to static province list only when the API is unavailable.
 */
export function usePakistanAddressOptions(
  province: string | undefined,
): UsePakistanAddressOptionsResult {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [provincesError, setProvincesError] = useState(false);
  const [citiesError, setCitiesError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingProvinces(true);
    setProvincesError(false);
    shippingApi
      .getProvinces()
      .then((list) => {
        if (!cancelled) setProvinces(list);
      })
      .catch(() => {
        if (!cancelled) setProvincesError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = province?.trim();
    if (!trimmed) {
      setCities([]);
      setCitiesError(false);
      setLoadingCities(false);
      return;
    }

    let cancelled = false;
    setLoadingCities(true);
    setCitiesError(false);
    shippingApi
      .getCities(trimmed)
      .then((rows) => {
        if (!cancelled) {
          setCities(rows.map((c) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCities([]);
          setCitiesError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [province]);

  const provinceOptions =
    provinces.length > 0 ? provinces : provincesError ? PAKISTAN_PROVINCES : [];

  return {
    provinces: provinceOptions,
    cities,
    loadingProvinces,
    loadingCities,
    provincesError,
    citiesError,
  };
}

/** Include a pre-filled city not yet in the API list (saved addresses / edits). */
export function mergeCityOptions(
  cities: CityOption[],
  currentCity?: string,
): CityOption[] {
  const trimmed = currentCity?.trim();
  if (!trimmed) return cities;
  const exists = cities.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) return cities;
  return [{ id: trimmed, name: trimmed }, ...cities];
}

/** Preferred nationwide shipping method when auto-selecting at checkout. */
export function pickDefaultShippingMethodId<
  T extends { methodId: string; methodCode: string },
>(options: T[]): string | null {
  if (options.length === 0) return null;
  const economy = options.find((o) => o.methodCode === 'economy_shipping');
  return (economy ?? options[0]).methodId;
}
