import React, { useEffect, useState, useRef } from 'react';
import { StampLocation, StampSettings } from '../types/stamp';
import { CompassDial } from './CompassDial';
import { MiniMap } from './MiniMap';
import { formatCoordinates, formatIndonesianDate } from '../utils/geo';
import { Edit3, Plus, Image as ImageIcon, X } from 'lucide-react';

interface TimestampOverlayProps {
  location: StampLocation;
  settings: StampSettings;
  onEditRequest?: () => void;
  onOpenLogoPicker?: () => void;
  onHeadingChange?: (deg: number) => void;
  onMapImageReady?: (img: HTMLImageElement) => void;
  onLogoImageReady?: (img: HTMLImageElement | null) => void;
}

export const TimestampOverlay: React.FC<TimestampOverlayProps> = ({
  location,
  settings,
  onEditRequest,
  onOpenLogoPicker,
  onHeadingChange,
  onMapImageReady,
  onLogoImageReady,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Preload logo for canvas renderer
  useEffect(() => {
    if (settings.showLogo && settings.logoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = settings.logoUrl;
      img.onload = () => {
        logoImgRef.current = img;
        if (onLogoImageReady) onLogoImageReady(img);
      };
      img.onerror = () => {
        if (onLogoImageReady) onLogoImageReady(null);
      };
    } else {
      logoImgRef.current = null;
      if (onLogoImageReady) onLogoImageReady(null);
    }
  }, [settings.showLogo, settings.logoUrl, onLogoImageReady]);

  const timeString = formatIndonesianDate(
    currentTime,
    settings.timezone,
    settings.useRealTime ? undefined : settings.customTime,
    settings.useRealTime ? undefined : settings.customDate
  );

  const coordsString = formatCoordinates(location.latitude, location.longitude, true);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* TOP ROW: Compass on top-left, Logo on top-right */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Compass Dial */}
        {settings.showCompass ? (
          <div className="pointer-events-auto">
            <CompassDial
              heading={location.heading ?? 348}
              size={88}
              interactive={true}
              onHeadingChange={onHeadingChange}
            />
          </div>
        ) : (
          <div />
        )}

        {/* Top Right: Custom / Agency Logo - Completely transparent with no background box for PNGs */}
        {settings.showLogo && (
          <div className="pointer-events-auto relative group">
            {settings.logoUrl ? (
              <div
                onClick={onOpenLogoPicker}
                className="relative cursor-pointer transition-transform active:scale-95 flex items-center justify-center p-0 bg-transparent border-0 shadow-none"
                title="Klik untuk mengganti logo"
                style={{
                  width: `${settings.logoSize || 80}px`,
                  height: `${settings.logoSize || 80}px`,
                }}
              >
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
                />
                {/* Discrete edit indicator on hover */}
                <div className="absolute -bottom-1 -right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Edit3 className="w-2.5 h-2.5 text-blue-300" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogoPicker}
                className="px-2.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 text-white text-xs font-medium flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                title="Tambahkan logo perusahaan / dinas / instansi"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Logo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM ROW: Mini Map on bottom-left, Text overlay on bottom-right */}
      <div className="flex items-end justify-between w-full gap-2 relative">
        {/* Bottom Left Mini Map */}
        {settings.showMap && (
          <div className="pointer-events-auto shrink-0 -ml-3 sm:-ml-5 -mb-3 sm:-mb-5">
            <MiniMap
              latitude={location.latitude}
              longitude={location.longitude}
              size={128}
              zoom={settings.mapZoom}
              opacity={settings.mapOpacity ?? 0.85}
              onClick={onEditRequest}
              onImageReady={onMapImageReady}
            />
          </div>
        )}

        {/* Bottom Right Text Lines */}
        <div
          onClick={onEditRequest}
          className="pointer-events-auto cursor-pointer ml-auto text-right flex flex-col items-end group transition-all"
          title="Klik untuk mengubah teks atau alamat"
        >
          {/* Subtle edit badge visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <Edit3 className="w-2.5 h-2.5" />
            <span>Klik untuk edit teks</span>
          </div>

          <div
            className="flex flex-col font-sans tracking-normal leading-[1.3] text-white"
            style={{
              color: settings.textColor || '#ffffff',
              textShadow: settings.textShadow
                ? '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)'
                : 'none',
              fontSize:
                settings.textSize === 'small'
                  ? '0.85rem'
                  : settings.textSize === 'large'
                  ? '1.15rem'
                  : '0.98rem',
            }}
          >
            {/* 1. Date & Time */}
            <div className="font-normal">{timeString}</div>

            {/* 2. Coordinates */}
            {settings.showCoordinates && (
              <div className="font-normal">{coordsString}</div>
            )}

            {/* 3-7. Address Lines */}
            {settings.showAddress && (
              <>
                {location.street && <div>{location.street}</div>}
                {location.suburb && <div>{location.suburb}</div>}
                {location.district && <div>{location.district}</div>}
                {location.city && <div>{location.city}</div>}
                {location.province && <div>{location.province}</div>}
              </>
            )}

            {/* Extra watermark / notes */}
            {settings.watermarkNote && (
              <div className="font-medium text-amber-200">{settings.watermarkNote}</div>
            )}
            {location.projectName && (
              <div className="font-medium">Proyek: {location.projectName}</div>
            )}
            {location.userName && (
              <div className="font-medium">Petugas: {location.userName}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
