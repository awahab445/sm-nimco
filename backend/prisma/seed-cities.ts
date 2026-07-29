import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as XLSX from 'xlsx';

type ZoneTier = {
  name: string;
  rateUpTo5kg: number;
  rateUpTo10kg: number;
  perKgOver10kg: number;
};

const VIA_TO_PROVINCE: Record<string, string> = {
  LAHORE: 'Punjab',
  FAISALABAD: 'Punjab',
  RAWALPINDI: 'Punjab',
  MULTAN: 'Punjab',
  GUJRANWALA: 'Punjab',
  SIALKOT: 'Punjab',
  BAHAWALPUR: 'Punjab',
  SARGODHA: 'Punjab',
  SHEIKHUPURA: 'Punjab',
  JHANG: 'Punjab',
  SAHIWAL: 'Punjab',
  GUJRAT: 'Punjab',
  JHELUM: 'Punjab',
  KASUR: 'Punjab',
  ATTOCK: 'Punjab',
  MIANWALI: 'Punjab',
  CHAKWAL: 'Punjab',
  'GUJAR KHAN': 'Punjab',
  JAUHRABAD: 'Punjab',
  KHARIAN: 'Punjab',
  'MANDI BAHAUDDIN': 'Punjab',
  WAZIRABAD: 'Punjab',
  LAYYAH: 'Punjab',
  BHAKKAR: 'Punjab',
  SAMUNDRI: 'Punjab',
  GOJRA: 'Punjab',
  SADIQABAD: 'Punjab',
  BAHAWALNAGAR: 'Punjab',
  'DERA GHAZI KHAN': 'Punjab',
  KHANEWAL: 'Punjab',
  TALAGANG: 'Punjab',
  MUZAFFARGARH: 'Punjab',
  MURREE: 'Punjab',
  'MIAN CHANNU': 'Punjab',
  VEHARI: 'Punjab',
  CHINIOT: 'Punjab',
  OKARA: 'Punjab',
  PAKPATTAN: 'Punjab',
  DASKA: 'Punjab',
  PASRUR: 'Punjab',
  NAROWAL: 'Punjab',
  HAFIZABAD: 'Punjab',
  KAMOKE: 'Punjab',
  BUREWALA: 'Punjab',
  'CHICHA WATNI': 'Punjab',
  'JALAL PUR JATTA': 'Punjab',
  'KHAIR PUR MEERU': 'Punjab',
  'BHAI PHERU': 'Punjab',
  LALAMUSA: 'Punjab',
  'TOBA TEK SINGH': 'Punjab',
  CHICHAWATNI: 'Punjab',
  LODHRAN: 'Punjab',
  TAXILA: 'Punjab',
  KARACHI: 'Sindh',
  HYDERABAD: 'Sindh',
  SUKKUR: 'Sindh',
  LARKANA: 'Sindh',
  'NAWAB SHAH': 'Sindh',
  'MIRPUR KHAS': 'Sindh',
  JACOBABAD: 'Sindh',
  'MIRPUR MATHELO': 'Sindh',
  DADU: 'Sindh',
  BADIN: 'Sindh',
  THATTA: 'Sindh',
  SHIKARPUR: 'Sindh',
  'TANDO ADAM': 'Sindh',
  'TANDO ALLAHYAR': 'Sindh',
  PESHAWAR: 'Khyber Pakhtunkhwa',
  MARDAN: 'Khyber Pakhtunkhwa',
  ABBOTABAD: 'Khyber Pakhtunkhwa',
  KOHAT: 'Khyber Pakhtunkhwa',
  'DERA ISMAIL KHA': 'Khyber Pakhtunkhwa',
  NOWSHERA: 'Khyber Pakhtunkhwa',
  HARIPUR: 'Khyber Pakhtunkhwa',
  MANSEHRA: 'Khyber Pakhtunkhwa',
  BATKHELA: 'Khyber Pakhtunkhwa',
  TAMIRGARAHA: 'Khyber Pakhtunkhwa',
  SWABI: 'Khyber Pakhtunkhwa',
  'MINGORA  (SWAT)': 'Khyber Pakhtunkhwa',
  JEHANGIRA: 'Khyber Pakhtunkhwa',
  BANNU: 'Khyber Pakhtunkhwa',
  KARK: 'Khyber Pakhtunkhwa',
  CHITRAL: 'Khyber Pakhtunkhwa',
  HANGU: 'Khyber Pakhtunkhwa',
  CHARSADDA: 'Khyber Pakhtunkhwa',
  TANK: 'Khyber Pakhtunkhwa',
  QUETTA: 'Balochistan',
  TURBAT: 'Balochistan',
  KHUZDAR: 'Balochistan',
  ZHOB: 'Balochistan',
  LORALAI: 'Balochistan',
  SIBI: 'Balochistan',
  GWADAR: 'Balochistan',
  CHAMAN: 'Balochistan',
  HUB: 'Balochistan',
  'MUZAFFARABAD(AK)': 'Azad Kashmir',
  'RAWALAKOT (A.K)': 'Azad Kashmir',
  'KOTLI (A .K)': 'Azad Kashmir',
  'DADYAL (A. K)': 'Azad Kashmir',
  BHIMBER: 'Azad Kashmir',
  'MIRPUR (A. K)': 'Azad Kashmir',
  ISLAMABAD: 'Islamabad Capital Territory',
};

/** Fallback zone tiers derived from cities-data Rates sheet (Min 10Kg Charge / Per Kg). */
const DEFAULT_ZONE_TIERS: Record<string, ZoneTier> = {
  A: { name: 'Zone A', rateUpTo5kg: 175, rateUpTo10kg: 350, perKgOver10kg: 35 },
  B: { name: 'Zone B', rateUpTo5kg: 225, rateUpTo10kg: 450, perKgOver10kg: 45 },
  C: { name: 'Zone C', rateUpTo5kg: 250, rateUpTo10kg: 500, perKgOver10kg: 50 },
  D: { name: 'Zone D', rateUpTo5kg: 400, rateUpTo10kg: 800, perKgOver10kg: 80 },
  E: {
    name: 'Zone E',
    rateUpTo5kg: 550,
    rateUpTo10kg: 1100,
    perKgOver10kg: 110,
  },
};

function cellString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function resolveProvince(via: string | undefined): string {
  if (!via) return 'Punjab';
  const key = via.trim().toUpperCase();
  return VIA_TO_PROVINCE[key] ?? 'Punjab';
}

/**
 * Parse Rates sheet: left block is Min 10Kg Charge / Per Kg by Zone A–E.
 * rateUpTo5kg = 5 × perKg, rateUpTo10kg = 10 × perKg, perKgOver10kg = perKg.
 */
function parseZoneTiersFromRatesSheet(
  workbook: XLSX.WorkBook,
): Record<string, ZoneTier> {
  const tiers = { ...DEFAULT_ZONE_TIERS };
  const sheet = workbook.Sheets['Rates'];
  if (!sheet) return tiers;

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
  });

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) continue;
    const zoneLabel = cellString(row[2]).trim();
    const match = /^Zone\s+([A-E])$/i.exec(zoneLabel);
    if (!match) continue;
    const code = match[1].toUpperCase();
    const perKg = Number(row[3]);
    if (!Number.isFinite(perKg) || perKg < 0) continue;
    tiers[code] = {
      name: `Zone ${code}`,
      rateUpTo5kg: perKg * 5,
      rateUpTo10kg: perKg * 10,
      perKgOver10kg: perKg,
    };
  }

  return tiers;
}

export async function seedCities(prisma: PrismaClient) {
  const filePath = path.resolve(__dirname, '../../cities-data.xlsb');
  const workbook = XLSX.readFile(filePath);

  const sheet = workbook.Sheets['Table1'];
  if (!sheet) throw new Error('Sheet "Table1" not found in cities-data.xlsb');

  const rows = XLSX.utils.sheet_to_json<{
    city_id: string | number;
    city_name: string;
    ole_zone: string;
    via: string;
  }>(sheet);

  const zoneTiers = parseZoneTiersFromRatesSheet(workbook);

  const zoneMap = new Map<string, string>();
  for (const [code, info] of Object.entries(zoneTiers)) {
    const zone = await prisma.courierZone.upsert({
      where: { code },
      update: {
        name: info.name,
        rateUpTo5kg: info.rateUpTo5kg,
        rateUpTo10kg: info.rateUpTo10kg,
        perKgOver10kg: info.perKgOver10kg,
      },
      create: {
        code,
        name: info.name,
        rateUpTo5kg: info.rateUpTo5kg,
        rateUpTo10kg: info.rateUpTo10kg,
        perKgOver10kg: info.perKgOver10kg,
      },
    });
    zoneMap.set(code, zone.id);
  }

  const cityAgg = new Map<
    string,
    {
      cityCode: string;
      name: string;
      via: string;
      zoneCounts: Record<string, number>;
    }
  >();

  for (const row of rows) {
    const nameUpper = String(row.city_name ?? '')
      .trim()
      .toUpperCase();
    if (!nameUpper) continue;

    const zoneCode = String(row.ole_zone ?? '')
      .trim()
      .toUpperCase();
    if (!zoneCode || !zoneMap.has(zoneCode)) continue;

    let entry = cityAgg.get(nameUpper);
    if (!entry) {
      entry = {
        cityCode: String(row.city_id ?? '').trim(),
        name: String(row.city_name ?? '').trim(),
        via: String(row.via ?? '').trim(),
        zoneCounts: {},
      };
      cityAgg.set(nameUpper, entry);
    }
    entry.zoneCounts[zoneCode] = (entry.zoneCounts[zoneCode] || 0) + 1;
  }

  let upserted = 0;
  for (const [, city] of cityAgg) {
    const bestZone = Object.entries(city.zoneCounts).sort(
      (a, b) => b[1] - a[1],
    )[0][0];
    const zoneId = zoneMap.get(bestZone)!;
    const province = resolveProvince(city.via);

    await prisma.courierCity.upsert({
      where: { cityCode: city.cityCode },
      update: {
        name: city.name,
        province,
        zoneId,
        via: city.via || null,
      },
      create: {
        cityCode: city.cityCode,
        name: city.name,
        province,
        zoneId,
        via: city.via || null,
      },
    });
    upserted++;
  }

  console.log(
    `Seed cities: ${zoneMap.size} zones (5kg/10kg tiers), ${upserted} cities upserted.`,
  );
}
