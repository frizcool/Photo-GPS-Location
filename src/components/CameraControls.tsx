import React, { useRef } from 'react';
import {
  Camera,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Clock,
  Square,
  Grid3X3,
  Upload,
  MapPin,
  Navigation,
  Moon,
} from 'lucide-react';
import { AspectRatio, SavedPhoto } from '../types/stamp';

interface CameraControlsProps {
  onCapture: () => void;
  onFlipCamera: () => void;
  onOpenSettings: () => void;
  onOpenGallery: () => void;
  onUploadPhoto: (file: File) => void;
  recentPhoto: SavedPhoto | null;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  timerSeconds: number;
  onTimerChange: (seconds: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isTakingPhoto: boolean;
  cityName: string;
  locationMode: 'device' | 'custom';
  onToggleLocationMode: () => void;
  nightMode?: boolean;
  onToggleNightMode?: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onFlipCamera,
  onOpenSettings,
  onOpenGallery,
  onUploadPhoto,
  recentPhoto,
  aspectRatio,
  onAspectRatioChange,
  timerSeconds,
  onTimerChange,
  showGrid,
  onToggleGrid,
  isTakingPhoto,
  cityName,
  locationMode,
  onToggleLocationMode,
  nightMode = false,
  onToggleNightMode,
}) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // Cycle aspect ratio original -> 1:1 -> 4:3 -> 16:9 -> original
  const cycleAspectRatio = () => {
    if (aspectRatio === 'original') onAspectRatioChange('1:1');
    else if (aspectRatio === '1:1') onAspectRatioChange('4:3');
    else if (aspectRatio === '4:3') onAspectRatioChange('16:9');
    else onAspectRatioChange('original');
  };

  // Cycle timer 0 -> 3 -> 5 -> 0
  const cycleTimer = () => {
    if (timerSeconds === 0) onTimerChange(3);
    else if (timerSeconds === 3) onTimerChange(5);
    else onTimerChange(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPhoto(file);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-md px-3 pt-2.5 pb-6 border-t border-white/10 select-none flex flex-col items-center">
      {/* Hidden File Input for Device Photo Upload */}
      <input
        type="file"
        ref={uploadInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Quick Actions Bar (Responsive on Mobile) */}
      <div className="flex items-center justify-between w-full max-w-md mb-3 text-xs">
        {/* Location Mode 2-Option Switcher Pill */}
        <button
          type="button"
          onClick={onToggleLocationMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all shadow-sm active:scale-95 ${
            locationMode === 'device'
              ? 'bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-400/50'
              : 'bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-400/50'
          }`}
          title="Klik untuk beralih antara GPS Asli dan Lokasi Kustom"
        >
          {locationMode === 'device' ? (
            <Navigation className="w-3.5 h-3.5 animate-pulse text-white" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-white" />
          )}
          <span className="font-semibold">
            {locationMode === 'device' ? 'GPS Asli' : 'Kustom'}
          </span>
          <span className="text-[11px] opacity-80 truncate max-w-[90px]">
            ({cityName || 'Lokasi'})
          </span>
        </button>

        {/* Quick Tools Group */}
        <div className="flex items-center gap-1.5">
          {/* Aspect Ratio */}
          <button
            type="button"
            onClick={cycleAspectRatio}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
            title="Rasio Foto (Asli, 1:1, 4:3, 16:9)"
          >
            <Square className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-mono text-[11px]">
              {aspectRatio === 'original' ? 'Asli' : aspectRatio}
            </span>
          </button>

          {/* Self-Timer */}
          <button
            type="button"
            onClick={cycleTimer}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all active:scale-95 ${
              timerSeconds > 0
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Timer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px]">{timerSeconds > 0 ? `${timerSeconds}s` : 'Off'}</span>
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={onToggleGrid}
            className={`p-2 rounded-full transition-all active:scale-95 ${
              showGrid
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Grid 3x3"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>

          {/* Quick Night Mode Toggle Button */}
          {onToggleNightMode && (
            <button
              type="button"
              onClick={onToggleNightMode}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all active:scale-95 ${
                nightMode
                  ? 'bg-indigo-600 text-white font-bold shadow-md ring-1 ring-indigo-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Mode Malam (Low-light Boost & High-contrast Overlay)"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden xs:inline sm:inline">
                {nightMode ? 'Malam' : 'Normal'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bottom Controls (Optimized for Mobile Touch) */}
      <div className="flex items-center justify-between w-full max-w-sm px-2 sm:px-4">
        {/* Gallery / Recent Stamped Thumbnail */}
        <button
          type="button"
          onClick={onOpenGallery}
          className="relative w-12 h-12 rounded-xl border-2 border-white/30 overflow-hidden bg-slate-800 flex items-center justify-center hover:border-white transition-all shadow-md active:scale-90"
          title="Buka Galeri Foto"
        >
          {recentPhoto ? (
            <img
              src={recentPhoto.dataUrl}
              alt="Foto Terakhir"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-white/70" />
          )}
        </button>

        {/* Prominent Upload Photo From Device Button */}
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-90 border border-white/20 text-white flex flex-col items-center justify-center transition-all shadow-md"
          title="Unggah Foto dari Galeri / File Perangkat"
        >
          <Upload className="w-4 h-4 text-sky-400" />
          <span className="text-[8px] font-medium text-slate-300 mt-0.5">Unggah</span>
        </button>

        {/* Shutter Button (Large mobile thumb target) */}
        <button
          type="button"
          disabled={isTakingPhoto}
          onClick={onCapture}
          className="relative p-1 rounded-full border-4 border-white active:scale-90 transition-transform cursor-pointer"
          title="Ambil Foto Timestamp"
        >
          <div
            className={`w-16 h-16 rounded-full transition-colors flex items-center justify-center shadow-lg ${
              isTakingPhoto ? 'bg-red-500 scale-95' : 'bg-white active:bg-slate-200'
            }`}
          >
            <div className="w-13 h-13 rounded-full border-2 border-black/15 flex items-center justify-center">
              <Camera className="w-6 h-6 text-slate-900" />
            </div>
          </div>
        </button>

        {/* Flip Camera */}
        <button
          type="button"
          onClick={onFlipCamera}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all shadow-md"
          title="Putar Kamera Depan/Belakang"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all shadow-md"
          title="Pengaturan Alamat & Format"
        >
          <Sliders className="w-5 h-5 text-blue-300" />
        </button>
      </div>
    </div>
  );
};
