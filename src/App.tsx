/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StampLocation, StampSettings, SavedPhoto, AspectRatio } from './types/stamp';
import { CameraView } from './components/CameraView';
import { CameraControls } from './components/CameraControls';
import { SettingsModal } from './components/SettingsModal';
import { PhotoPreviewModal } from './components/PhotoPreviewModal';
import { GalleryModal } from './components/GalleryModal';
import { LogoModal } from './components/LogoModal';
import { PRESET_LOCATIONS, reverseGeocode, formatIndonesianDate } from './utils/geo';
import { PRESET_LOGOS } from './utils/logoPresets';
import { Camera, MapPin, Compass, Shield, Sliders, Navigation } from 'lucide-react';

const STORAGE_KEY = 'gps_timestamp_saved_photos';

// Initial state matching the user's reference image
const INITIAL_LOCATION: StampLocation = {
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
};

const INITIAL_SETTINGS: StampSettings = {
  language: 'id',
  timezone: 'WIB',
  useRealTime: true,
  showCompass: true,
  showMap: true,
  mapOpacity: 0.85, // Transparent / semi-opaque map
  showCoordinates: true,
  showAddress: true,
  showNotes: false,
  mapZoom: 16,
  textColor: '#ffffff',
  textSize: 'medium',
  textShadow: true,
  aspectRatio: '1:1', // Reference image is square
  timerSeconds: 0,
  watermarkNote: '',
  showLogo: true,
  logoUrl: PRESET_LOGOS[0].dataUrl, // Hospital / Medical Cross logo preset
  logoSize: 75,
  locationMode: 'custom', // 2 options: 'device' (GPS asli) or 'custom' (bebas edit/preset)
};

export default function App() {
  const [location, setLocation] = useState<StampLocation>(INITIAL_LOCATION);
  const [settings, setSettings] = useState<StampSettings>(INITIAL_SETTINGS);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Uploaded photo from device state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);
  const [currentPreviewPhoto, setCurrentPreviewPhoto] = useState<string | null>(null);

  // Saved photos in local storage
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save photos to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPhotos));
    } catch (err) {
      console.warn('Failed to save photos to localStorage:', err);
    }
  }, [savedPhotos]);

  // GPS detection helper
  const handleDetectGps = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, heading } = pos.coords;
        const addrDetails = await reverseGeocode(latitude, longitude);

        setLocation((prev) => ({
          ...prev,
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          altitude: altitude ? Math.round(altitude) : prev.altitude,
          heading: heading !== null && !isNaN(heading) ? Math.round(heading) : prev.heading,
          street: addrDetails.street || prev.street,
          suburb: addrDetails.suburb || prev.suburb,
          district: addrDetails.district || prev.district,
          city: addrDetails.city || prev.city,
          province: addrDetails.province || prev.province,
          country: addrDetails.country || prev.country,
        }));

        setIsGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, []);

  // Continuous GPS tracking when in 'device' mode
  useEffect(() => {
    if (settings.locationMode !== 'device') return;
    if (!navigator.geolocation) return;

    setIsGpsLoading(true);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, heading } = pos.coords;
        const addrDetails = await reverseGeocode(latitude, longitude);

        setLocation((prev) => ({
          ...prev,
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          altitude: altitude ? Math.round(altitude) : prev.altitude,
          heading: heading !== null && !isNaN(heading) ? Math.round(heading) : prev.heading,
          street: addrDetails.street || prev.street,
          suburb: addrDetails.suburb || prev.suburb,
          district: addrDetails.district || prev.district,
          city: addrDetails.city || prev.city,
          province: addrDetails.province || prev.province,
          country: addrDetails.country || prev.country,
        }));

        setIsGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
        setIsGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [settings.locationMode]);

  // Toggle between 2 Location Options: Device GPS vs Custom Location
  const handleToggleLocationMode = () => {
    setSettings((prev) => {
      const nextMode = prev.locationMode === 'device' ? 'custom' : 'device';
      if (nextMode === 'device') {
        handleDetectGps();
      }
      return { ...prev, locationMode: nextMode };
    });
  };

  // Handle Photo Captured
  const handlePhotoCaptured = (dataUrl: string) => {
    const newPhoto: SavedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: formatIndonesianDate(new Date(), settings.timezone),
      location: { ...location },
      heading: location.heading ?? 348,
      createdAt: Date.now(),
    };

    setSavedPhotos((prev) => [newPhoto, ...prev.slice(0, 24)]);
    setCurrentPreviewPhoto(dataUrl);
  };

  // Upload an image from device gallery to stamp and adjust it
  const handleUploadPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setUploadedPhotoUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (id: string) => {
    setSavedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-950 text-white overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <header className="h-12 bg-black/85 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-tight text-white">
            GPS Timestamp Camera
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Logo Button */}
          <button
            type="button"
            onClick={() => setIsLogoModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-slate-200 transition-all"
            title="Atur Logo Pojok Kanan Atas"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Logo</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-slate-200 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </header>

      {/* Main Camera Viewfinder with Pan/Zoom & Real-time Overlays */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        <CameraView
          location={location}
          settings={settings}
          facingMode={facingMode}
          showGrid={showGrid}
          uploadedPhotoUrl={uploadedPhotoUrl}
          onClearUploadedPhoto={() => setUploadedPhotoUrl(null)}
          onAspectRatioChange={(ratio: AspectRatio) =>
            setSettings((s) => ({ ...s, aspectRatio: ratio }))
          }
          onPhotoCaptured={handlePhotoCaptured}
          onEditLocationRequest={() => setIsSettingsOpen(true)}
          onOpenLogoPicker={() => setIsLogoModalOpen(true)}
          onHeadingChange={(deg) =>
            setLocation((prev) => ({ ...prev, heading: Math.round(deg) }))
          }
          isTakingPhoto={isTakingPhoto}
          setIsTakingPhoto={setIsTakingPhoto}
        />
      </main>

      {/* Bottom Camera Controls Bar (Mobile-Optimized) */}
      <footer className="shrink-0 z-20">
        <CameraControls
          onCapture={() => setIsTakingPhoto(true)}
          onFlipCamera={() =>
            setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
          }
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onUploadPhoto={handleUploadPhoto}
          recentPhoto={savedPhotos[0] || null}
          aspectRatio={settings.aspectRatio}
          onAspectRatioChange={(ratio: AspectRatio) =>
            setSettings((s) => ({ ...s, aspectRatio: ratio }))
          }
          timerSeconds={settings.timerSeconds}
          onTimerChange={(secs) => setSettings((s) => ({ ...s, timerSeconds: secs }))}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((g) => !g)}
          isTakingPhoto={isTakingPhoto}
          cityName={location.city || location.suburb || 'Lokasi'}
          locationMode={settings.locationMode}
          onToggleLocationMode={handleToggleLocationMode}
        />
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        location={location}
        onLocationChange={setLocation}
        settings={settings}
        onSettingsChange={setSettings}
        onRefreshGps={handleDetectGps}
        isGpsLoading={isGpsLoading}
      />

      <LogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        logoUrl={settings.logoUrl}
        onLogoChange={(url) => setSettings((s) => ({ ...s, logoUrl: url }))}
        logoSize={settings.logoSize || 75}
        onLogoSizeChange={(size) => setSettings((s) => ({ ...s, logoSize: size }))}
        showLogo={settings.showLogo}
        onToggleShowLogo={(show) => setSettings((s) => ({ ...s, showLogo: show }))}
      />

      <PhotoPreviewModal
        photoUrl={currentPreviewPhoto}
        onClose={() => setCurrentPreviewPhoto(null)}
        onRetake={() => {
          setCurrentPreviewPhoto(null);
          setIsTakingPhoto(true);
        }}
      />

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={savedPhotos}
        onDeletePhoto={handleDeletePhoto}
        onSelectPhoto={(photo) => setCurrentPreviewPhoto(photo.dataUrl)}
      />
    </div>
  );
}
