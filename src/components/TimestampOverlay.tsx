import React, { useEffect, useState, useRef } from 'react';
import { StampLocation, StampSettings, MapStyle } from '../types/stamp';
import { CompassDial } from './CompassDial';
import { MiniMap } from './MiniMap';
import { formatCoordinates, formatIndonesianDate } from '../utils/geo';
import { getFontStyleOption } from '../utils/fontStyles';
import { Edit3, Plus, Image as ImageIcon, X } from 'lucide-react';

interface TimestampOverlayProps {
  location: StampLocation;
  settings: StampSettings;
  onEditRequest?: () => void;
  onOpenLogoPicker?: () => void;
  onHeadingChange?: (deg: number) => void;
  onMapImageReady?: (img: HTMLImageElement) => void;
  onLogoImageReady?: (img: HTMLImageElement | null) => void;
  onMapStyleChange?: (style: MapStyle) => void;
}

export const TimestampOverlay: React.FC<TimestampOverlayProps> = ({
  location,
  settings,
  onEditRequest,
  onOpenLogoPicker,
  onHeadingChange,
  onMapImageReady,
  onLogoImageReady,
  onMapStyleChange,
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

  const onLogoImageReadyRef = useRef(onLogoImageReady);
  useEffect(() => {
    onLogoImageReadyRef.current = onLogoImageReady;
  });

  // Preload logo for canvas renderer
  useEffect(() => {
    if (settings.showLogo && settings.logoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = settings.logoUrl;
      img.onload = () => {
        logoImgRef.current = img;
        onLogoImageReadyRef.current?.(img);
      };
      img.onerror = () => {
        onLogoImageReadyRef.current?.(null);
      };
    } else {
      logoImgRef.current = null;
      onLogoImageReadyRef.current?.(null);
    }
  }, [settings.showLogo, settings.logoUrl]);

  const timeString = formatIndonesianDate(
    currentTime,
    settings.timezone,
    settings.useRealTime ? undefined : settings.customTime,
    settings.useRealTime ? undefined : settings.customDate,
    {
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      showDayName: settings.showDayName,
    }
  );

  const coordsString = formatCoordinates(
    location.latitude,
    location.longitude,
    true,
    settings.coordinateFormat
  );

  const placement = settings.stampPlacement || 'bottom-right';
  const isRight = placement.endsWith('right');

  // 1. Compass Dial Node
  const compassDialSize = 84;
  const compassNode = settings.showCompass ? (
    <div className="pointer-events-auto">
      <CompassDial
        heading={location.heading ?? 348}
        size={compassDialSize}
        interactive={true}
        styleVariant={settings.compassStyle || 'reference'}
        onHeadingChange={onHeadingChange}
      />
    </div>
  ) : null;

  // 2. Logo Node (Proportionally matched with Compass Dial)
  const logoBoxDim = Math.round(compassDialSize * ((settings.logoSize || 80) / 80));
  const logoNode = settings.showLogo ? (
    <div className="pointer-events-auto relative group">
      {settings.logoUrl ? (
        <div
          onClick={onOpenLogoPicker}
          className="relative cursor-pointer transition-transform active:scale-95 flex items-center justify-center p-0 bg-transparent border-0 shadow-none"
          title="Klik untuk mengganti logo atau sesuaikan ukuran"
          style={{
            width: `${logoBoxDim}px`,
            height: `${logoBoxDim}px`,
            maxWidth: `${Math.round(logoBoxDim * 1.4)}px`,
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
  ) : null;

  // 3. Mini Map Node
  const isMapOnRight = placement === 'bottom-left' || placement === 'top-left';
  const mapNode = settings.showMap ? (
    <div
      className={`pointer-events-auto shrink-0 ${
        isMapOnRight
          ? '-mr-3 sm:-mr-5 -mb-3 sm:-mb-5'
          : '-ml-3 sm:-ml-5 -mb-3 sm:-mb-5'
      }`}
    >
      <MiniMap
        latitude={location.latitude}
        longitude={location.longitude}
        size={128}
        zoom={settings.mapZoom}
        opacity={settings.mapOpacity ?? 0.85}
        mapStyle={settings.mapStyle || 'roadmap'}
        onMapStyleChange={onMapStyleChange}
        onClick={onEditRequest}
        onImageReady={onMapImageReady}
      />
    </div>
  ) : null;

  // 4. Text Information Overlay Node
  const textNode = (
    <div
      onClick={onEditRequest}
      className={`pointer-events-auto cursor-pointer flex flex-col group transition-all max-w-[85%] sm:max-w-[70%] ${
        isRight ? 'items-end text-right ml-auto' : 'items-start text-left mr-auto'
      }`}
      title="Klik untuk mengubah teks atau alamat"
    >
      {/* Subtle edit badge visible on hover */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs ${
          isRight ? 'self-end' : 'self-start'
        }`}
      >
        <Edit3 className="w-2.5 h-2.5" />
        <span>Klik untuk edit teks</span>
      </div>

      <div
        className={`flex flex-col tracking-normal leading-[1.3] text-white transition-all ${
          settings.nightMode
            ? settings.nightModeContrast === 'ultra'
              ? 'bg-black/92 border border-white/40 shadow-2xl backdrop-blur-md px-3.5 py-2.5 rounded-xl'
              : 'bg-slate-950/80 border border-sky-400/35 shadow-xl backdrop-blur-md px-3 py-2 rounded-xl'
            : ''
        }`}
        style={{
          fontFamily: getFontStyleOption(settings.fontFamily).cssFamily,
          letterSpacing: getFontStyleOption(settings.fontFamily).letterSpacing || 'normal',
          color: settings.textColor || '#ffffff',
          textShadow:
            settings.textShadow || settings.nightMode
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
        {/* 0. Optional Custom Header */}
        {settings.customHeader && (
          <div className="font-semibold text-sky-200 tracking-wide text-[0.95em]">
            {settings.customHeader}
          </div>
        )}

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

        {/* 8. Optional Custom Subtext */}
        {settings.customSubtext && (
          <div className="font-normal text-emerald-300">
            {settings.customSubtext}
          </div>
        )}

        {/* 9. Extra watermark / notes */}
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
  );

  // Distribute items into 4 corners according to user's stampPlacement preference
  let topLeftNode: React.ReactNode = null;
  let topRightNode: React.ReactNode = null;
  let bottomLeftNode: React.ReactNode = null;
  let bottomRightNode: React.ReactNode = null;

  if (placement === 'bottom-left') {
    topLeftNode = compassNode;
    topRightNode = logoNode;
    bottomLeftNode = textNode;
    bottomRightNode = mapNode;
  } else if (placement === 'top-left') {
    topLeftNode = textNode;
    topRightNode = compassNode;
    bottomLeftNode = logoNode;
    bottomRightNode = mapNode;
  } else if (placement === 'top-right') {
    topLeftNode = compassNode;
    topRightNode = textNode;
    bottomLeftNode = mapNode;
    bottomRightNode = logoNode;
  } else {
    // 'bottom-right' (default)
    topLeftNode = compassNode;
    topRightNode = logoNode;
    bottomLeftNode = mapNode;
    bottomRightNode = textNode;
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* TOP ROW */}
      <div className="flex items-start justify-between w-full gap-2">
        <div className="flex justify-start items-start">{topLeftNode}</div>
        <div className="flex justify-end items-start ml-auto">{topRightNode}</div>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex items-end justify-between w-full gap-2 relative">
        <div className="flex justify-start items-end">{bottomLeftNode}</div>
        <div className="flex justify-end items-end ml-auto">{bottomRightNode}</div>
      </div>
    </div>
  );
};
