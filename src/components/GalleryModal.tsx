import React, { useState } from 'react';
import { X, Download, Trash2, Calendar, MapPin, Eye } from 'lucide-react';
import { SavedPhoto } from '../types/stamp';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: SavedPhoto[];
  onDeletePhoto: (id: string) => void;
  onSelectPhoto: (photo: SavedPhoto) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  photos,
  onDeletePhoto,
  onSelectPhoto,
}) => {
  const [activePhoto, setActivePhoto] = useState<SavedPhoto | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold text-white">
              Galeri Foto Timestamp ({photos.length})
            </h2>
            <p className="text-xs text-slate-400">
              Foto yang telah Anda ambil tersimpan di perangkat ini
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {photos.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="font-medium text-sm text-slate-300">Belum ada foto yang diambil</p>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan tombol kamera untuk mengambil foto pertama Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 aspect-square shadow-md"
                >
                  <img
                    src={item.dataUrl}
                    alt="Timestamp"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => {
                      onSelectPhoto(item);
                      onClose();
                    }}
                  />

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
                    <div className="flex justify-end gap-1 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePhoto(item.id);
                        }}
                        className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pointer-events-auto">
                      <div className="text-[10px] text-slate-300 font-mono truncate">
                        {item.timestamp}
                      </div>
                      <div className="text-[10px] text-white font-medium truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span>{item.location.city || item.location.suburb || 'Lokasi'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <span>Format file: JPEG Berkualitas Tinggi</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
