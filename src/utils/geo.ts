import { StampLocation } from '../types/stamp';

export const INDONESIA_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIA_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const PRESET_LOCATIONS: { name: string; location: StampLocation }[] = [
  {
    name: 'RS Royal Surabaya (Sesuai Gambar)',
    location: {
      latitude: -7.328954,
      longitude: 112.750881,
      accuracy: 8,
      altitude: 12,
      heading: 348,
      street: 'Jalan Rungkut Industri I No.1',
      suburb: 'Kendangsari',
      district: 'Kecamatan Tenggilis Mejoyo',
      city: 'Surabaya',
      province: 'Jawa Timur',
      country: 'Indonesia',
      postalCode: '60292',
    },
  },
  {
    name: 'RSUD Dr. Soetomo Surabaya',
    location: {
      latitude: -7.268153,
      longitude: 112.758362,
      accuracy: 6,
      altitude: 10,
      heading: 15,
      street: 'Jl. Mayjen Prof. Dr. Moestopo No.6-8',
      suburb: 'Airlangga',
      district: 'Kecamatan Gubeng',
      city: 'Surabaya',
      province: 'Jawa Timur',
      country: 'Indonesia',
      postalCode: '60286',
    },
  },
  {
    name: 'Monumen Nasional (Monas), Jakarta',
    location: {
      latitude: -6.175392,
      longitude: 106.827153,
      accuracy: 5,
      altitude: 15,
      heading: 0,
      street: 'Jl. Medan Merdeka Barat No.12',
      suburb: 'Gambir',
      district: 'Kecamatan Gambir',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postalCode: '10110',
    },
  },
  {
    name: 'Gedung Sate, Bandung',
    location: {
      latitude: -6.902476,
      longitude: 107.618698,
      accuracy: 7,
      altitude: 720,
      heading: 90,
      street: 'Jl. Diponegoro No.22',
      suburb: 'Citarum',
      district: 'Kecamatan Bandung Wetan',
      city: 'Kota Bandung',
      province: 'Jawa Barat',
      country: 'Indonesia',
      postalCode: '40115',
    },
  },
  {
    name: 'Pantai Kuta, Bali',
    location: {
      latitude: -8.718482,
      longitude: 115.16864,
      accuracy: 10,
      altitude: 5,
      heading: 270,
      street: 'Jl. Pantai Kuta',
      suburb: 'Kuta',
      district: 'Kecamatan Kuta',
      city: 'Kabupaten Badung',
      province: 'Bali',
      country: 'Indonesia',
      postalCode: '80361',
    },
  },
];

export function formatCoordinatesDMS(lat: number, lon: number): string {
  const formatSingle = (val: number, isLat: boolean) => {
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    const abs = Math.abs(val);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(1);
    return `${deg}°${min}'${sec}" ${dir}`;
  };
  return `${formatSingle(lat, true)} ${formatSingle(lon, false)}`;
}

export function formatCoordinates(
  lat: number,
  lon: number,
  useComma = true,
  format: 'decimal' | 'dms' = 'decimal'
): string {
  if (format === 'dms') {
    return formatCoordinatesDMS(lat, lon);
  }
  const latStr = lat.toFixed(6);
  const lonStr = lon.toFixed(6);
  if (useComma) {
    return `${latStr.replace('.', ',')} ${lonStr.replace('.', ',')}`;
  }
  return `${latStr} ${lonStr}`;
}

export interface DateFormatOptions {
  dateFormat?: 'full_id' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat?: '24h' | '12h';
  showDayName?: boolean;
}

export function formatIndonesianDate(
  date: Date,
  timezone: string = 'WIB',
  overrideTime?: string,
  overrideDate?: string,
  options?: DateFormatOptions
): string {
  let targetDate = new Date(date);

  if (overrideDate) {
    const [y, m, d] = overrideDate.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      targetDate.setFullYear(y, m - 1, d);
    }
  }

  if (overrideTime) {
    const [hh, mm, ss] = overrideTime.split(':').map(Number);
    if (!isNaN(hh)) targetDate.setHours(hh);
    if (!isNaN(mm)) targetDate.setMinutes(mm);
    if (!isNaN(ss)) targetDate.setSeconds(ss);
  }

  const dayName = INDONESIA_DAYS[targetDate.getDay()];
  const dayNum = String(targetDate.getDate()).padStart(2, '0');
  const monthNum = String(targetDate.getMonth() + 1).padStart(2, '0');
  const monthName = INDONESIA_MONTHS[targetDate.getMonth()];
  const year = targetDate.getFullYear();

  // Time handling (24h vs 12h AM/PM)
  let hoursNum = targetDate.getHours();
  const rawMinutes = String(targetDate.getMinutes()).padStart(2, '0');
  const rawSeconds = String(targetDate.getSeconds()).padStart(2, '0');
  let ampm = '';

  if (options?.timeFormat === '12h') {
    ampm = hoursNum >= 12 ? ' PM' : ' AM';
    hoursNum = hoursNum % 12;
    if (hoursNum === 0) hoursNum = 12;
  }
  const hours = String(hoursNum).padStart(2, '0');
  const timeString = `${hours}:${rawMinutes}:${rawSeconds}${ampm}`;

  // Timezone label
  let tzLabel = timezone;
  if (timezone === 'AUTO') {
    const offset = -targetDate.getTimezoneOffset() / 60;
    if (offset === 7) tzLabel = 'WIB';
    else if (offset === 8) tzLabel = 'WITA';
    else if (offset === 9) tzLabel = 'WIT';
    else tzLabel = `UTC${offset >= 0 ? '+' : ''}${offset}`;
  }

  // Date formatting
  let datePart = `${targetDate.getDate()} ${monthName} ${year}`;
  if (options?.dateFormat === 'DD/MM/YYYY') {
    datePart = `${dayNum}/${monthNum}/${year}`;
  } else if (options?.dateFormat === 'MM/DD/YYYY') {
    datePart = `${monthNum}/${dayNum}/${year}`;
  } else if (options?.dateFormat === 'YYYY-MM-DD') {
    datePart = `${year}-${monthNum}-${dayNum}`;
  }

  const includeDay = options?.showDayName ?? true;
  const prefix = includeDay ? `${dayName}, ` : '';

  return `${prefix}${datePart} ${timeString} ${tzLabel}`;
}

// Reverse Geocoding helper via OpenStreetMap
export async function reverseGeocode(lat: number, lon: number): Promise<Partial<StampLocation>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=id`,
      {
        headers: {
          'User-Agent': 'GPSTimestampCameraApp/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Reverse geocode failed');
    }

    const data = await res.json();
    const addr = data.address || {};

    const street =
      addr.road ||
      addr.pedestrian ||
      addr.street ||
      addr.industrial ||
      addr.amenity ||
      addr.hospital ||
      addr.building ||
      'Jalan Lokasi';

    const suburb =
      addr.neighbourhood ||
      addr.suburb ||
      addr.village ||
      addr.hamlet ||
      addr.quarter ||
      '';

    const district =
      addr.city_district ||
      addr.subdistrict ||
      (addr.county ? `Kecamatan ${addr.county}` : '');

    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      '';

    const province = addr.state || '';
    const country = addr.country || 'Indonesia';
    const postalCode = addr.postcode || '';

    return {
      street: street + (addr.house_number ? ` No.${addr.house_number}` : ''),
      suburb: suburb,
      district: district.startsWith('Kecamatan') ? district : district ? `Kecamatan ${district}` : '',
      city: city,
      province: province,
      country: country,
      postalCode: postalCode,
    };
  } catch (err) {
    console.warn('Geocoding fallback applied:', err);
    return {};
  }
}

export function getHeadingDirection(degree: number): string {
  const directions = [
    'U', 'UTL', 'TL', 'TTL', 'T', 'TTG', 'TG', 'STG',
    'S', 'SBD', 'BD', 'BBD', 'B', 'BBL', 'BL', 'UBL'
  ];
  const idx = Math.round(degree / 22.5) % 16;
  return directions[idx];
}
