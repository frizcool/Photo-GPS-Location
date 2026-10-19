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

export type AspectRatio = '1:1' | '4:3' | '16:9' | 'full';

export interface ImageAdjustment {
  zoom: number; // 1.0 to 3.0
  panX: number; // -100 to 100 (% offset)
  panY: number; // -100 to 100 (% offset)
  rotate: number; // 0, 90, 180, 270
}

export interface StampSettings {
  language: 'id' | 'en';
  timezone: TimezoneOption;
  customDate?: string; // If user overrides date
  customTime?: string; // If user overrides time
  useRealTime: boolean;
  showCompass: boolean;
  showMap: boolean;
  mapOpacity: number; // 0.2 to 1.0
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
}

export interface SavedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  location: StampLocation;
  heading: number;
  createdAt: number;
}
