import { StampFontFamily } from '../types/stamp';

export interface FontStyleOption {
  id: StampFontFamily;
  name: string;
  category: string;
  cssFamily: string;
  canvasFont: string;
  letterSpacing?: string;
  description: string;
  badge: string;
  sampleText: string;
  recommendedFor: string;
}

export const FONT_STYLE_OPTIONS: FontStyleOption[] = [
  {
    id: 'mono',
    name: 'Roboto Mono',
    category: 'Tabular Telemetri GPS',
    cssFamily: "'Roboto Mono', 'Courier New', Courier, monospace",
    canvasFont: "'Roboto Mono', 'Courier New', monospace",
    letterSpacing: '0.01em',
    description: 'Angka tabular sejajar presisi, standar stempel kamera GPS profesional & survei lapangan.',
    badge: 'Standar GPS Referensi',
    sampleText: '21/10/2026 14:05:40 -7.328954 112.750881',
    recommendedFor: 'Survei GPS, pemetaan, rekam medis, dan bukti audit',
  },
  {
    id: 'sans',
    name: 'Inter Modern',
    category: 'Modern Sans-Serif',
    cssFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    canvasFont: "'Inter', system-ui, -apple-system, sans-serif",
    letterSpacing: 'normal',
    description: 'Tipografi modern minimalis, garis proporsional bersih, dan sangat nyaman dibaca.',
    badge: 'Modern Clean',
    sampleText: '21/10/2026 14:05:40 | Surabaya, Jawa Timur',
    recommendedFor: 'Dokumentasi umum, kantor, absensi karyawan, dan instansi',
  },
  {
    id: 'condensed',
    name: 'Oswald Condensed',
    category: 'Industrial Bold',
    cssFamily: "'Oswald', 'Impact', 'Arial Narrow', sans-serif",
    canvasFont: "'Oswald', 'Impact', 'Arial Narrow', sans-serif",
    letterSpacing: '0.04em',
    description: 'Huruf vertikal padat & tegas dengan visibilitas tinggi, khas stempel proyek teknik sipil.',
    badge: 'Proyek & Lapangan',
    sampleText: '21/10/2026 14:05:40 | PROYEK INSPEKSI 100%',
    recommendedFor: 'Konstruksi gedung, pengawasan proyek, tambang, & logistik',
  },
  {
    id: 'tech',
    name: 'Orbitron Tactical',
    category: 'Tactical HUD & Sci-Fi',
    cssFamily: "'Orbitron', 'Roboto Mono', monospace",
    canvasFont: "'Orbitron', monospace",
    letterSpacing: '0.06em',
    description: 'Gaya digital futuristik HUD militer dengan garis sudut tajam untuk navigasi luar ruangan.',
    badge: 'Taktis Militer',
    sampleText: '21/10/2026 14:05:40 | ALT: 45m HDG: 348°N',
    recommendedFor: 'Patroli keamanan, hiking, SAR, drone, & kegiatan outdoor',
  },
  {
    id: 'serif',
    name: 'Merriweather Serif',
    category: 'Formal & Editorial',
    cssFamily: "'Merriweather', 'Georgia', 'Times New Roman', serif",
    canvasFont: "'Merriweather', 'Georgia', serif",
    letterSpacing: 'normal',
    description: 'Gaya klasik berwibawa dan elegan, menyerupai dokumen sertifikasi resmi & berita acara.',
    badge: 'Dokumen Resmi',
    sampleText: '21 Oktober 2026 | Berita Acara Pemeriksaan',
    recommendedFor: 'Sertifikasi tanah, verifikasi legalitas, inspeksi kehakiman',
  },
  {
    id: 'classic-courier',
    name: 'Classic Typewriter',
    category: 'Vintage Monospace',
    cssFamily: "'Courier New', Courier, monospace",
    canvasFont: "'Courier New', Courier, monospace",
    letterSpacing: '0.02em',
    description: 'Karakter mekanikal mesin ketik vintage otentik dengan sentuhan arsip kepolisian klasik.',
    badge: 'Vintage Retro',
    sampleText: '21/10/2026 14:05:40 | REG.ID: 884-X9',
    recommendedFor: 'Arsip investigasi, gaya vintage retro, dan stempel unik',
  },
];

export function getFontStyleOption(id?: StampFontFamily): FontStyleOption {
  return FONT_STYLE_OPTIONS.find((f) => f.id === id) || FONT_STYLE_OPTIONS[0];
}
