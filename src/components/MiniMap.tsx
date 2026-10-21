import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  size?: number;
  zoom?: number;
  opacity?: number;
  onClick?: () => void;
  onImageReady?: (img: HTMLImageElement) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  latitude,
  longitude,
  size = 140,
  zoom = 16,
  opacity = 0.85,
  onClick,
  onImageReady,
}) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [loadError, setLoadError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Convert lat/lon/zoom to OSM tile coordinates
  // staticmap via OpenStreetMap or Carto
  const tileX = Math.floor(((longitude + 180) / 360) * Math.pow(2, currentZoom));
  const latRad = (latitude * Math.PI) / 180;
  const tileY = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, currentZoom)
  );

  // Using reliable high-speed tiles (CartoDB Positron / OSM standard)
  const tileUrl = `https://tile.openstreetmap.org/${currentZoom}/${tileX}/${tileY}.png`;

  const onImageReadyRef = useRef(onImageReady);
  useEffect(() => {
    onImageReadyRef.current = onImageReady;
  });

  useEffect(() => {
    setLoadError(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = tileUrl;
    img.onload = () => {
      imgRef.current = img;
      onImageReadyRef.current?.(img);
    };
    img.onerror = () => {
      setLoadError(true);
    };
  }, [tileUrl]);

  return (
    <div
      className="relative overflow-hidden border border-black/30 shadow-lg bg-slate-200/90 select-none group transition-opacity"
      style={{
        width: size,
        height: size,
        opacity: opacity,
      }}
      onClick={onClick}
      title="Peta Lokasi - Klik untuk detail"
    >
      {/* Map Tile Layer or Fallback Vector */}
      {!loadError ? (
        <img
          src={tileUrl}
          alt="Peta Lokasi"
          className="w-full h-full object-cover pointer-events-none scale-125 filter contrast-105"
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="w-full h-full bg-[#e8ecef] relative p-1">
          {/* Procedural Roads */}
          <div className="absolute inset-0 flex items-center justify-center opacity-70">
            <div className="w-full h-3 bg-white border-y border-slate-300" />
            <div className="h-full w-3 bg-white border-x border-slate-300 absolute" />
          </div>
          {/* Green block */}
          <div className="absolute top-2 left-2 w-8 h-8 bg-[#d5e8d4] rounded-xs" />
          <div className="absolute bottom-2 right-2 w-10 h-6 bg-[#d5e8d4] rounded-xs" />
        </div>
      )}

      {/* Center Pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative -translate-y-2.5 filter drop-shadow(0 2px 3px rgba(0,0,0,0.4))">
          <MapPin className="w-7 h-7 text-red-600 fill-red-600" />
          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-[7px] left-[11px]" />
        </div>
      </div>

      {/* Google Watermark in bottom left */}
      <div className="absolute bottom-1 left-1.5 flex items-center text-[10px] font-bold tracking-tight select-none pointer-events-none drop-shadow-sm bg-white/70 px-1 py-0.5 rounded-xs">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </div>

      {/* Mini zoom controls on hover */}
      <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentZoom((z) => Math.min(19, z + 1));
          }}
          className="p-1 bg-white/90 text-slate-800 rounded-sm shadow-xs hover:bg-white"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentZoom((z) => Math.max(12, z - 1));
          }}
          className="p-1 bg-white/90 text-slate-800 rounded-sm shadow-xs hover:bg-white"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
