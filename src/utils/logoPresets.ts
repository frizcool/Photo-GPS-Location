// Preset logos as SVG data URIs for immediate selection

export interface LogoPreset {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
}

export const PRESET_LOGOS: LogoPreset[] = [
  {
    id: 'hospital-cross',
    name: 'Rumah Sakit / Medis',
    category: 'Kesehatan',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="%23dc2626" stroke="%23ffffff" stroke-width="4"/>
      <rect x="42" y="22" width="16" height="56" rx="4" fill="%23ffffff"/>
      <rect x="22" y="42" width="56" height="16" rx="4" fill="%23ffffff"/>
      <circle cx="50" cy="50" r="48" fill="none" stroke="%23dc2626" stroke-width="2" opacity="0.4"/>
    </svg>`,
  },
  {
    id: 'kemenkes-shield',
    name: 'Kesehatan / Instansi Medis',
    category: 'Kesehatan',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <path d="M50 8 L85 24 V52 C85 74 50 92 50 92 C50 92 15 74 15 52 V24 Z" fill="%230284c7" stroke="%23ffffff" stroke-width="3"/>
      <path d="M50 14 L80 28 V50 C80 69 50 84 50 84 C50 84 20 69 20 50 V28 Z" fill="%230369a1"/>
      <rect x="43" y="32" width="14" height="40" rx="3" fill="%23ffffff"/>
      <rect x="30" y="45" width="40" height="14" rx="3" fill="%23ffffff"/>
    </svg>`,
  },
  {
    id: 'hse-safety',
    name: 'K3 / Proyek Konstruksi',
    category: 'Konstruksi',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="%2316a34a" stroke="%23ffffff" stroke-width="4"/>
      <rect x="42" y="24" width="16" height="52" rx="3" fill="%23ffffff"/>
      <rect x="24" y="42" width="52" height="16" rx="3" fill="%23ffffff"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="%2316a34a" stroke-width="5"/>
    </svg>`,
  },
  {
    id: 'gold-badge',
    name: 'Inspeksi & Sertifikasi Resmi',
    category: 'Resmi',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <polygon points="50,5 63,18 81,18 88,34 100,47 94,64 96,82 79,89 70,103 52,98 35,103 26,89 9,82 11,64 5,47 17,34 24,18 42,18" fill="%23eab308" stroke="%23ca8a04" stroke-width="2"/>
      <circle cx="50" cy="50" r="32" fill="%231e293b" stroke="%23fef08a" stroke-width="3"/>
      <path d="M38 52 L46 60 L64 40" fill="none" stroke="%23fef08a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
];
