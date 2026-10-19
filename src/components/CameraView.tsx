import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StampLocation, StampSettings, ImageAdjustment } from '../types/stamp';
import { TimestampOverlay } from './TimestampOverlay';
import {
  Camera,
  RefreshCw,
  Upload,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  AlertCircle,
  SlidersHorizontal,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { createStampedImage } from '../utils/canvasStamp';
import { cameraAudio } from '../utils/audio';

const SAMPLE_BACKGROUNDS = [
  {
    name: 'Kamar Rumah Sakit (Sesuai Referensi)',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ruang Kantor / Administrasi',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Proyek Lapangan / Konstruksi',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Luar Ruangan / Jalan Raya',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
];

interface CameraViewProps {
  location: StampLocation;
  settings: StampSettings;
  facingMode: 'user' | 'environment';
  showGrid: boolean;
  uploadedPhotoUrl?: string | null;
  onClearUploadedPhoto?: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  onEditLocationRequest: () => void;
  onOpenLogoPicker: () => void;
  onHeadingChange: (deg: number) => void;
  isTakingPhoto: boolean;
  setIsTakingPhoto: (val: boolean) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  location,
  settings,
  facingMode,
  showGrid,
  uploadedPhotoUrl,
  onClearUploadedPhoto,
  onPhotoCaptured,
  onEditLocationRequest,
  onOpenLogoPicker,
  onHeadingChange,
  isTakingPhoto,
  setIsTakingPhoto,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [internalCustomImage, setInternalCustomImage] = useState<string | null>(null);
  const [activeSampleIdx, setActiveSampleIdx] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const activeImage = uploadedPhotoUrl || internalCustomImage;

  // Image Adjustment State (Pan / Geser, Zoom in/out, Rotate)
  const [adjustment, setAdjustment] = useState<ImageAdjustment>({
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotate: 0,
  });
  const [showAdjustBar, setShowAdjustBar] = useState<boolean>(false);

  // Touch & Drag state for fluid mobile interaction
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startPanRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const startZoomRef = useRef(1.0);

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      if (activeImage) return;

      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung pada browser ini.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: unknown) {
        console.warn('Camera access issue:', err);
        const errMsg =
          err instanceof Error
            ? err.message
            : 'Izin kamera belum diberikan atau perangkat tidak memiliki kamera.';
        setCameraError(errMsg);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, activeImage]);

  // Handle Real Device Orientation Compass (iOS webkitCompassHeading & Android deviceorientationabsolute)
  useEffect(() => {
    let lastHeading = location.heading ?? 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let rawHeading: number | null = null;

      // 1. iOS: webkitCompassHeading (direct magnetic heading)
      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        rawHeading = webkitHeading;
      } else if (e.alpha !== null && !isNaN(e.alpha)) {
        // 2. Android absolute or standard orientation
        let heading = (360 - e.alpha) % 360;
        const screenOrientation =
          window.screen?.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0;
        heading = (heading + screenOrientation) % 360;
        rawHeading = heading;
      }

      if (rawHeading !== null) {
        // Smooth rotational damping
        let diff = (rawHeading - lastHeading) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        const smoothed = (lastHeading + diff * 0.35 + 360) % 360;
        lastHeading = smoothed;
        onHeadingChange(Math.round(smoothed));
      }
    };

    // Listen to device orientation with high responsiveness
    const win = window as unknown as {
      DeviceOrientationEvent?: typeof DeviceOrientationEvent;
      addEventListener: typeof window.addEventListener;
      removeEventListener: typeof window.removeEventListener;
      ondeviceorientationabsolute?: unknown;
    };

    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    } else if (win.DeviceOrientationEvent) {
      win.addEventListener('deviceorientation', handleOrientation as EventListener, true);
    }

    return () => {
      win.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      win.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
    };
  }, [onHeadingChange, location.heading]);

  // Request iOS Compass Permission on user touch
  const handleRequestCompassPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission ===
        'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (res === 'granted') {
          // Permission granted on iOS
        }
      } catch (err) {
        console.warn('iOS orientation permission error:', err);
      }
    }
  };

  // Pan / Drag Handlers (touch-friendly)
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: clientX, y: clientY };
    startPanRef.current = { x: adjustment.panX, y: adjustment.panY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const dx = clientX - startPosRef.current.x;
    const dy = clientY - startPosRef.current.y;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const deltaPercentX = (dx / width) * 100;
    const deltaPercentY = (dy / height) * 100;

    setAdjustment((prev) => ({
      ...prev,
      panX: Math.max(-50, Math.min(50, startPanRef.current.x + deltaPercentX)),
      panY: Math.max(-50, Math.min(50, startPanRef.current.y + deltaPercentY)),
    }));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    setAdjustment((prev) => ({
      ...prev,
      zoom: Math.max(1.0, Math.min(3.0, parseFloat((prev.zoom + zoomDelta).toFixed(2)))),
    }));
  };

  // Touch Pinch-to-Zoom & Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchDistanceRef.current = dist;
      startZoomRef.current = adjustment.zoom;
    } else if (e.touches.length === 1) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / touchDistanceRef.current;
      const newZoom = Math.max(1.0, Math.min(3.0, startZoomRef.current * ratio));
      setAdjustment((prev) => ({
        ...prev,
        zoom: parseFloat(newZoom.toFixed(2)),
      }));
    } else if (e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Actual Trigger Photo Capture logic
  const executeCapture = useCallback(async () => {
    try {
      setIsFlashing(true);
      cameraAudio.playShutterSound();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setTimeout(() => setIsFlashing(false), 160);

      let imageSource: CanvasImageSource | null = null;
      let sourceWidth = 1080;
      let sourceHeight = 1080;

      if (activeImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = activeImage;
        await new Promise((res) => {
          img.onload = res;
        });
        imageSource = img;
        sourceWidth = img.naturalWidth || 1080;
        sourceHeight = img.naturalHeight || 1080;
      } else if (videoRef.current && videoRef.current.videoWidth > 0) {
        imageSource = videoRef.current;
        sourceWidth = videoRef.current.videoWidth;
        sourceHeight = videoRef.current.videoHeight;
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = SAMPLE_BACKGROUNDS[activeSampleIdx].url;
        await new Promise((res) => {
          img.onload = res;
        });
        imageSource = img;
        sourceWidth = img.naturalWidth || 1080;
        sourceHeight = img.naturalHeight || 1080;
      }

      const stampedDataUrl = await createStampedImage(
        imageSource,
        sourceWidth,
        sourceHeight,
        location,
        settings,
        mapImageRef.current,
        logoImageRef.current,
        adjustment
      );

      onPhotoCaptured(stampedDataUrl);
    } catch (err) {
      console.error('Failed to capture photo:', err);
    } finally {
      setIsTakingPhoto(false);
      setCountdown(null);
    }
  }, [
    activeImage,
    activeSampleIdx,
    location,
    settings,
    adjustment,
    onPhotoCaptured,
    setIsTakingPhoto,
  ]);

  // Watch isTakingPhoto prop to trigger capture (with optional timer)
  useEffect(() => {
    if (!isTakingPhoto) return;

    if (settings.timerSeconds > 0) {
      let count = settings.timerSeconds;
      setCountdown(count);
      cameraAudio.playBeep(false);

      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          cameraAudio.playBeep(false);
        } else {
          clearInterval(interval);
          setCountdown(null);
          cameraAudio.playBeep(true);
          executeCapture();
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      executeCapture();
    }
  }, [isTakingPhoto, settings.timerSeconds, executeCapture]);

  // Handle Upload Image from File Picker directly
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setInternalCustomImage(event.target.result);
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          setStream(null);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearImage = () => {
    setInternalCustomImage(null);
    if (onClearUploadedPhoto) onClearUploadedPhoto();
  };

  const getAspectClass = () => {
    switch (settings.aspectRatio) {
      case '1:1':
        return 'aspect-square max-h-[75vh] sm:max-h-[80vh]';
      case '4:3':
        return 'aspect-4/3 max-h-[78vh] sm:max-h-[82vh]';
      case '16:9':
        return 'aspect-9/16 sm:aspect-16/9 max-h-[82vh] sm:max-h-[85vh]';
      default:
        return 'h-full w-full';
    }
  };

  const transformStyle = {
    transform: `translate(${adjustment.panX}%, ${adjustment.panY}%) scale(${adjustment.zoom}) rotate(${adjustment.rotate}deg)`,
    transition: isDraggingRef.current ? 'none' : 'transform 100ms ease-out',
  };

  return (
    <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden select-none w-full">
      {/* File input for uploading photo from device */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Viewfinder Box with Touch Handling */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerUp}
        className={`relative w-full max-w-2xl mx-auto overflow-hidden shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing touch-none ${getAspectClass()}`}
      >
        {/* Shutter White Flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping opacity-90 transition-opacity duration-150" />
        )}

        {/* Live Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none animate-pulse">
            <span className="text-white text-8xl font-black drop-shadow-2xl">
              {countdown}
            </span>
          </div>
        )}

        {/* Camera Feed OR Custom Image OR Sample Background */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center bg-black">
          {activeImage ? (
            <img
              src={activeImage}
              alt="Foto Pilihan"
              style={transformStyle}
              className="w-full h-full object-cover select-none pointer-events-none origin-center"
            />
          ) : !cameraError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={transformStyle}
              className={`w-full h-full object-cover select-none pointer-events-none origin-center ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
          ) : (
            <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center">
              <img
                src={SAMPLE_BACKGROUNDS[activeSampleIdx].url}
                alt="Sample View"
                style={transformStyle}
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none origin-center"
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              <div className="relative z-10 max-w-sm p-4 bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 text-center text-white m-4 shadow-xl pointer-events-auto">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">
                  Kamera Belum Aktif / Mode Unggah
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  {cameraError || 'Aktifkan izin kamera atau pilih foto langsung dari galeri HP/laptop Anda.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih Foto dari HP
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSampleIdx(
                        (prev) => (prev + 1) % SAMPLE_BACKGROUNDS.length
                      )
                    }
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ganti Latar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rule of Thirds Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-20">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div />
          </div>
        )}

        {/* Live Stamped HUD Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <TimestampOverlay
            location={location}
            settings={settings}
            onEditRequest={onEditLocationRequest}
            onOpenLogoPicker={onOpenLogoPicker}
            onHeadingChange={(deg) => {
              handleRequestCompassPermission();
              onHeadingChange(deg);
            }}
            onMapImageReady={(img) => {
              mapImageRef.current = img;
            }}
            onLogoImageReady={(img) => {
              logoImageRef.current = img;
            }}
          />
        </div>

        {/* Top Controls: Banner for Uploaded Photo & Image Adjuster */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-auto">
          {activeImage ? (
            <div className="flex items-center gap-1.5 bg-blue-950/90 border border-blue-400/40 px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg text-[11px] text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Foto Terunggah</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="ml-1 text-sky-300 hover:text-white underline font-semibold"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={handleClearImage}
                className="ml-1 px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded-full text-[10px]"
              >
                Kamera
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdjustBar((v) => !v)}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all ${
                showAdjustBar || adjustment.zoom > 1.0 || adjustment.panX !== 0 || adjustment.panY !== 0
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-black/60 hover:bg-black/80 border-white/30 text-white/90'
              }`}
              title="Atur Zoom, Geser Posisi, dan Rotasi Gambar"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Sesuaikan {adjustment.zoom > 1.0 ? `${adjustment.zoom}x` : ''}</span>
            </button>
          )}

          {/* Quick Upload from Device Button */}
          {!activeImage && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/30 flex items-center gap-1 shadow-md transition-all"
              title="Pilih foto dari perangkat untuk di-cap"
            >
              <Upload className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline">Unggah Foto</span>
            </button>
          )}
        </div>

        {/* Floating Pan / Zoom / Crop Adjustment Panel */}
        {showAdjustBar && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm bg-slate-950/95 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl pointer-events-auto text-white text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                Geser & Zoom Foto
              </span>
              <button
                type="button"
                onClick={() =>
                  setAdjustment({ zoom: 1.0, panX: 0, panY: 0, rotate: 0 })
                }
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Reset Posisi
              </button>
            </div>

            {/* Zoom Slider and Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setAdjustment((prev) => ({
                    ...prev,
                    zoom: Math.max(1.0, parseFloat((prev.zoom - 0.1).toFixed(2))),
                  }))
                }
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Perkecil Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={adjustment.zoom}
                onChange={(e) =>
                  setAdjustment((prev) => ({
                    ...prev,
                    zoom: parseFloat(e.target.value),
                  }))
                }
                className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />

              <button
                type="button"
                onClick={() =>
                  setAdjustment((prev) => ({
                    ...prev,
                    zoom: Math.min(3.0, parseFloat((prev.zoom + 0.1).toFixed(2))),
                  }))
                }
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Perbesar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-white min-w-[35px] text-right">
                {adjustment.zoom.toFixed(1)}x
              </span>
            </div>

            {/* Quick zoom presets and rotate */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
              <div className="flex items-center gap-1.5">
                {[1.0, 1.5, 2.0].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() =>
                      setAdjustment((prev) => ({ ...prev, zoom: z }))
                    }
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      adjustment.zoom === z
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>

              {/* Rotate 90 deg */}
              <button
                type="button"
                onClick={() =>
                  setAdjustment((prev) => ({
                    ...prev,
                    rotate: (prev.rotate + 90) % 360,
                  }))
                }
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Putar 90 Derajat"
              >
                <RotateCw className="w-3 h-3" />
                <span>{adjustment.rotate}°</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-0.5">
              Geser langsung layar dengan jari / mouse untuk memposisikan foto
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
