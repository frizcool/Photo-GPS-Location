import React from 'react';
import { Download, Share2, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoPreviewModalProps {
  photoUrl: string | null;
  onClose: () => void;
  onRetake: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  photoUrl,
  onClose,
  onRetake,
}) => {
  if (!photoUrl) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });

    const now = new Date();
    const filename = `Timestamp_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
      now.getMinutes()
    ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.jpg`;

    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const blob = await (await fetch(photoUrl)).blob();
        const file = new File([blob], 'timestamp-photo.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'Foto Timestamp GPS',
          text: 'Foto diambil dengan Timestamp Camera',
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none animate-in fade-in duration-200">
      {/* Top action header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/10 z-10">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ambil Ulang</span>
        </button>

        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Foto Berhasil Diambil
        </span>

        <button
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Selesai
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        <img
          src={photoUrl}
          alt="Hasil Timestamp"
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
        />
      </div>

      {/* Bottom Download & Share Bar */}
      <div className="px-6 py-4 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 max-w-xs py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download Foto</span>
        </button>

        {typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={handleShare}
            className="py-3 px-4 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            title="Bagikan Foto"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
        )}
      </div>
    </div>
  );
};
