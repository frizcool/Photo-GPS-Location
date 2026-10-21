export interface StampLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  street: string;
  suburb: string; // Kelurahan / Desa
  district: string; // Kecamatan
  city: string; // Kota / Kabupaten
  province: string; // Provinsi
  country: string;
  postalCode?: string;
  notes?: string;
  projectName?: string;
  userName?: string;
}

export type TimezoneOption = 'WIB' | 'WITA' | 'WIT' | 'AUTO' | 'UTC';

export type AspectRatio = 'original' | '1:1' | '4:3' | '16:9';

export interface ImageAdjustment {
  zoom: number; // 0.5 to 3.0
  panX: number; // -100 to 100 (% offset)
  panY: number; // -100 to 100 (% offset)
  rotate: number; // 0, 90, 180, 270
  fitMode?: 'fit' | 'fill';
}

export type StampPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type MapStyle = 'roadmap' | 'satellite' | 'terrain';

export interface StampSettings {
  language: 'id' | 'en';
  timezone: TimezoneOption;
  customDate?: string; // If user overrides date
  customTime?: string; // If user overrides time
  useRealTime: boolean;
  showCompass: boolean;
  showMap: boolean;
  mapOpacity: number; // 0.2 to 1.0
  mapStyle?: MapStyle; // 'roadmap' | 'satellite' | 'terrain'
  showCoordinates: boolean;
  showAddress: boolean;
  showNotes: boolean;
  mapZoom: number;
  textColor: string;
  textSize: 'small' | 'medium' | 'large';
  textShadow: boolean;
  aspectRatio: AspectRatio;
  timerSeconds: number; // 0 = off, 3, 5, 10
  watermarkNote: string;
  showLogo: boolean;
  logoUrl: string | null;
  logoSize: number; // e.g. 60 - 120 px
  locationMode: 'device' | 'custom';
  // Custom text formatting
  dateFormat: 'full_id' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '24h' | '12h';
  showDayName: boolean;
  customHeader: string; // Teks kustom tambahan baris atas
  customSubtext: string; // Teks kustom tambahan baris bawah
  // Night Mode (Low light boost & high contrast)
  nightMode: boolean;
  nightModeContrast: 'high' | 'ultra';
  // Reference layout & Compass styles
  compassStyle: 'reference' | 'classic' | 'tactical';
  layoutPreset: 'reference' | 'standard';
  coordinateFormat: 'decimal' | 'dms';
  fontFamily: StampFontFamily;
  // Corner placement for information overlay
  stampPlacement: StampPlacement;
}

export type StampFontFamily =
  | 'mono'
  | 'sans'
  | 'condensed'
  | 'tech'
  | 'serif'
  | 'classic-courier';

export interface SettingsPreset {
  id: string;
  name: string;
  is_default?: boolean;
  config: Partial<StampSettings>;
  created_at?: string;
  updated_at?: string;
}

export interface SavedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  location: StampLocation;
  heading: number;
  createdAt: number;
}
