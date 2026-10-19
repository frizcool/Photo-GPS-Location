import React, { useRef } from 'react';
import { X, Upload, Trash2, Check, Shield, Plus } from 'lucide-react';
import { PRESET_LOGOS } from '../utils/logoPresets';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  logoSize: number;
  onLogoSizeChange: (size: number) => void;
  showLogo: boolean;
  onToggleShowLogo: (show: boolean) => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({
  isOpen,
  onClose,
  logoUrl,
  onLogoChange,
  logoSize,
  onLogoSizeChange,
  showLogo,
  onToggleShowLogo,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onLogoChange(event.target.result);
        onToggleShowLogo(true);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">
              Logo Pojok Kanan Atas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Toggle On/Off */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer">
            <div>
              <span className="font-semibold text-white block">Tampilkan Logo</span>
              <span className="text-[11px] text-slate-400">
                Tampilkan logo instansi/perusahaan di pojok kanan atas
              </span>
            </div>
            <input
              type="checkbox"
              checked={showLogo}
              onChange={(e) => onToggleShowLogo(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm"
            />
          </label>

          {/* Current Logo Preview */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Terpilih"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                ) : (
                  <Shield className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div>
                <span className="font-medium text-white block">
                  {logoUrl ? 'Logo Aktif' : 'Belum Ada Logo'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {logoUrl ? 'Ditampilkan di sudut kanan atas' : 'Pilih dari preset atau unggah'}
                </span>
              </div>
            </div>

            {logoUrl && (
              <button
                type="button"
                onClick={() => onLogoChange(null)}
                className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-200 border border-red-900 transition-colors"
                title="Hapus Logo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Custom Logo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Logo Sendiri (PNG / JPG)</span>
          </button>

          {/* Preset Logos */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-slate-400 font-medium">
              Atau Pilih Logo Siap Pakai:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_LOGOS.map((preset) => {
                const isSelected = logoUrl === preset.dataUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onLogoChange(preset.dataUrl);
                      onToggleShowLogo(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                        : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <img
                      src={preset.dataUrl}
                      alt={preset.name}
                      className="w-8 h-8 shrink-0 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate text-[11px] text-white">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {preset.category}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo Size Slider */}
          {logoUrl && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-slate-400">
                <span>Ukuran Logo:</span>
                <span className="font-mono text-white font-medium">{logoSize}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                step="5"
                value={logoSize}
                onChange={(e) => onLogoSizeChange(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
