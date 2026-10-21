import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { MapStyle } from '../types/stamp';
import {
  getMapTileUrl,
  getBackupMapTileUrl,
  getNextMapStyle,
  getMapStyleMeta,
} from '../utils/mapStyles';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  size?: number;
  zoom?: number;
  opacity?: number;
  mapStyle?: MapStyle;
  onMapStyleChange?: (style: MapStyle) => void;
  onClick?: () => void;
  onImageReady?: (img: HTMLImageElement) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  latitude,
  longitude,
  size = 140,
  zoom = 16,
  opacity = 0.85,
  mapStyle = 'roadmap',
  onMapStyleChange,
  onClick,
  onImageReady,
}) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [loadError, setLoadError] = useState(false);
  const [usingBackup, setUsingBackup] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync zoom prop when settings change externally
  useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);

  // Primary and backup tile URLs
  const primaryTileUrl = getMapTileUrl(mapStyle, currentZoom, latitude, longitude);
  const backupTileUrl = getBackupMapTileUrl(mapStyle, currentZoom, latitude, longitude);
  const activeTileUrl = usingBackup ? backupTileUrl : primaryTileUrl;

  const onImageReadyRef = useRef(onImageReady);
  useEffect(() => {
    onImageReadyRef.current = onImageReady;
  });

  // Reset backup flag when mapStyle, coordinates, or zoom change
  useEffect(() => {
    setUsingBackup(false);
    setLoadError(false);
  }, [mapStyle, currentZoom, latitude, longitude]);

  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeTileUrl;

    img.onload = () => {
      if (isCancelled) return;
      imgRef.current = img;
      setLoadError(false);
      onImageReadyRef.current?.(img);
    };

    img.onerror = () => {
      if (isCancelled) return;
      if (!usingBackup && backupTileUrl !== primaryTileUrl) {
        setUsingBackup(true);
      } else {
        setLoadError(true);
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [activeTileUrl, usingBackup, backupTileUrl, primaryTileUrl]);

  const styleMeta = getMapStyleMeta(mapStyle);

  const handleCycleStyle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMapStyleChange) {
      const next = getNextMapStyle(mapStyle);
      onMapStyleChange(next);
    }
  };

  return (
    <div
      className="relative overflow-hidden border border-black/40 shadow-xl bg-slate-900/90 select-none group transition-opacity"
      style={{
        width: size,
        height: size,
        opacity: opacity,
      }}
      onClick={onClick}
      title="Peta Lokasi - Klik untuk detail atau ubah gaya"
    >
      {/* Map Tile Layer or Fallback Vector */}
      {!loadError ? (
        <img
          key={activeTileUrl}
          src={activeTileUrl}
          alt={`Peta ${styleMeta.name}`}
          className={`w-full h-full object-cover pointer-events-none scale-125 transition-transform duration-300 ${
            mapStyle === 'satellite'
              ? 'brightness-105 contrast-110 saturate-105'
              : mapStyle === 'terrain'
              ? 'contrast-105 brightness-100'
              : 'contrast-105'
          }`}
          onError={() => {
            if (!usingBackup && backupTileUrl !== primaryTileUrl) {
              setUsingBackup(true);
            } else {
              setLoadError(true);
            }
          }}
        />
      ) : (
        /* Themed procedural vector fallbacks */
        <div className="w-full h-full relative p-1 overflow-hidden">
          {mapStyle === 'satellite' ? (
            <div className="w-full h-full bg-[#1e293b] relative">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute top-1 left-2 w-12 h-9 bg-[#166534]/50 border border-emerald-500/20 rounded-xs" />
              <div className="absolute bottom-2 right-2 w-14 h-8 bg-[#334155]/60 border border-slate-500/30 rounded-xs" />
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-full h-1 bg-slate-400" />
                <div className="h-full w-1 bg-slate-400 absolute" />
              </div>
            </div>
          ) : mapStyle === 'terrain' ? (
            <div className="w-full h-full bg-[#f3ede2] relative">
              <div className="absolute inset-0 opacity-30 flex flex-col justify-around">
                <div className="w-full h-0.5 bg-amber-800 rounded-full" />
                <div className="w-full h-0.5 bg-amber-700 rounded-full" />
                <div className="w-full h-0.5 bg-amber-600 rounded-full" />
              </div>
              <div className="absolute top-2 left-2 w-8 h-8 bg-[#dbe8d4] rounded-full opacity-60" />
              <div className="absolute bottom-1 right-2 w-12 h-6 bg-[#d1c7b7] rounded-sm opacity-50" />
            </div>
          ) : (
            <div className="w-full h-full bg-[#e8ecef] relative p-1">
              <div className="absolute inset-0 flex items-center justify-center opacity-70">
                <div className="w-full h-3 bg-white border-y border-slate-300" />
                <div className="h-full w-3 bg-white border-x border-slate-300 absolute" />
              </div>
              <div className="absolute top-2 left-2 w-8 h-8 bg-[#d5e8d4] rounded-xs" />
              <div className="absolute bottom-2 right-2 w-10 h-6 bg-[#d5e8d4] rounded-xs" />
            </div>
          )}
        </div>
      )}

      {/* Center Location Pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative -translate-y-2.5 filter drop-shadow(0 2px 4px rgba(0,0,0,0.65))">
          <MapPin className="w-7 h-7 text-red-600 fill-red-600" />
          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-[7px] left-[11px] shadow-xs" />
        </div>
      </div>

      {/* Map Style Quick-Switch Badge in Top-Left */}
      <button
        type="button"
        onClick={handleCycleStyle}
        className={`absolute top-1 left-1 pointer-events-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-tight transition-all shadow-md active:scale-95 ${
          mapStyle === 'satellite'
            ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-400/50 hover:bg-emerald-900'
            : mapStyle === 'terrain'
            ? 'bg-amber-950/90 text-amber-300 border border-amber-400/50 hover:bg-amber-900'
            : 'bg-black/75 text-sky-200 border border-sky-400/40 hover:bg-black/90'
        } backdrop-blur-xs`}
        title={`Gaya Peta saat ini: ${styleMeta.name}. Klik untuk mengganti (Satelit / Topografi / Jalan)`}
      >
        <Layers className="w-2.5 h-2.5 shrink-0" />
        <span>{styleMeta.shortName}</span>
      </button>

      {/* Google Watermark in bottom left */}
      <div className="absolute bottom-1 left-1.5 flex items-center text-[10px] font-bold tracking-tight select-none pointer-events-none drop-shadow-sm bg-black/60 backdrop-blur-xs border border-white/20 px-1 py-0.5 rounded-xs">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </div>

      {/* Mini zoom controls on hover */}
      <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentZoom((z) => Math.min(19, z + 1));
          }}
          className="p-1 bg-black/80 text-white rounded-sm shadow-md hover:bg-black border border-white/20 active:scale-90 transition-transform"
          title="Perbesar Peta (Zoom In)"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentZoom((z) => Math.max(12, z - 1));
          }}
          className="p-1 bg-black/80 text-white rounded-sm shadow-md hover:bg-black border border-white/20 active:scale-90 transition-transform"
          title="Perkecil Peta (Zoom Out)"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
