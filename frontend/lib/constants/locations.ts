/**
 * Pakistan provinces/territories and major cities for cascading address dropdowns.
 */

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Kashmir',
  'Gilgit-Baltistan',
  'Islamabad Capital Territory',
] as const;

export type PakistanProvince = (typeof PAKISTAN_PROVINCES)[number];

export const PAKISTAN_CITIES_BY_PROVINCE: Record<PakistanProvince, readonly string[]> = {
  Punjab: [
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sheikhupura',
    'Jhang',
    'Rahim Yar Khan',
    'Gujrat',
    'Sahiwal',
    'Okara',
    'Wah Cantonment',
    'Dera Ghazi Khan',
    'Kasur',
    'Chiniot',
    'Kamoke',
    'Hafizabad',
    'Sadiqabad',
    'Burewala',
    'Khanewal',
    'Muzaffargarh',
    'Mandi Bahauddin',
    'Jhelum',
    'Khanpur',
    'Pakpattan',
    'Daska',
    'Gojra',
    'Muridke',
    'Bahawalnagar',
    'Samundri',
    'Jaranwala',
    'Chishtian',
    'Attock',
    'Vehari',
    'Kamalia',
    'Kot Addu',
    'Ahmedpur East',
    'Taxila',
    'Wazirabad',
    'Layyah',
  ],
  Sindh: [
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Larkana',
    'Nawabshah',
    'Mirpur Khas',
    'Jacobabad',
    'Shikarpur',
    'Khairpur',
    'Dadu',
    'Thatta',
    'Tando Adam',
    'Tando Allahyar',
    'Kotri',
    'Badin',
    'Ghotki',
    'Sanghar',
    'Umerkot',
    'Matiari',
    'Naushahro Feroze',
    'Kashmore',
    'Qambar Shahdadkot',
    'Jamshoro',
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar',
    'Mardan',
    'Mingora',
    'Abbottabad',
    'Kohat',
    'Dera Ismail Khan',
    'Swabi',
    'Nowshera',
    'Charsadda',
    'Mansehra',
    'Bannu',
    'Timergara',
    'Chitral',
    'Haripur',
    'Battagram',
    'Hangu',
    'Karak',
    'Lakki Marwat',
    'Tank',
    'Upper Dir',
    'Lower Dir',
    'Shangla',
    'Buner',
    'Swat',
  ],
  Balochistan: [
    'Quetta',
    'Turbat',
    'Khuzdar',
    'Chaman',
    'Hub',
    'Gwadar',
    'Sibi',
    'Zhob',
    'Loralai',
    'Dera Bugti',
    'Usta Muhammad',
    'Pasni',
    'Kalat',
    'Mastung',
    'Nushki',
    'Pishin',
    'Qila Saifullah',
    'Panjgur',
    'Kharan',
    'Lasbela',
  ],
  'Azad Kashmir': [
    'Muzaffarabad',
    'Mirpur',
    'Kotli',
    'Rawalakot',
    'Bhimber',
    'Bagh',
    'Pallandri',
    'Hattian Bala',
    'Neelum',
    'Haveli',
  ],
  'Gilgit-Baltistan': [
    'Gilgit',
    'Skardu',
    'Hunza',
    'Chilas',
    'Ghanche',
    'Astore',
    'Ghizer',
    'Diamer',
    'Nagar',
    'Kharmang',
    'Shigar',
  ],
  'Islamabad Capital Territory': ['Islamabad'],
};

/** Cities for a province/territory; empty when none selected or unknown. */
export function getCitiesForProvince(province: string): readonly string[] {
  if (!province) return [];
  return PAKISTAN_CITIES_BY_PROVINCE[province as PakistanProvince] ?? [];
}

/**
 * City options for a select: known cities for the province, plus any
 * pre-filled value not in the list (so edits / guest pre-fills still show).
 */
export const PROVINCES_CACHE_KEY = 'pk-provinces';
export const CITIES_CACHE_PREFIX = 'pk-cities-';

export function getCitySelectOptions(province: string, currentCity?: string): string[] {
  const cities = [...getCitiesForProvince(province)];
  const trimmed = currentCity?.trim();
  if (trimmed && !cities.includes(trimmed)) {
    cities.unshift(trimmed);
  }
  return cities;
}
