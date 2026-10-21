import React, { useState } from 'react';
import { StampSettings, StampFontFamily } from '../types/stamp';
import { FONT_STYLE_OPTIONS, getFontStyleOption } from '../utils/fontStyles';
import { Type, Sparkles, Check, Eye, Sliders, Moon, Sun, Info } from 'lucide-react';

interface FontStyleSelectorProps {
  settings: StampSettings;
  onSettingsChange: (settings: StampSettings) => void;
  showFullPreview?: boolean;
}

export const FontStyleSelector: React.FC<FontStyleSelectorProps> = ({
  settings,
  onSettingsChange,
  showFullPreview = true,
}) => {
  const [previewTheme, setPreviewTheme] = useState<'slate' | 'ultra' | 'transparent'>('slate');
  const activeFont = getFontStyleOption(settings.fontFamily);

  const handleSelectFont = (fontId: StampFontFamily) => {
    onSettingsChange({
      ...settings,
      fontFamily: fontId,
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-slate-200 font-semibold text-xs flex items-center gap-1.5">
          <Type className="w-4 h-4 text-sky-400" />
          <span>Gaya Font Stempel Waktu (Timestamp Typography):</span>
        </label>
        <span className="text-[10px] text-sky-300 font-mono font-medium px-2 py-0.5 rounded-full bg-sky-950/70 border border-sky-800/60 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-sky-400" />
          {activeFont.name}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Pilih gaya tipografi teks yang dicetak pada foto timestamp. Setiap font dirancang khusus untuk kebutuhan survei, dokumentasi proyek, atau laporan resmi.
      </p>

      {/* 1. LIVE FONT PREVIEW CARD */}
      {showFullPreview && (
        <div className="rounded-xl border border-sky-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-3.5 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] font-semibold text-white">
                Pratinjau Font Terpilih (Live Preview):
              </span>
            </div>

            {/* Background Theme Switcher for Preview */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                type="button"
                onClick={() => setPreviewTheme('slate')}
                className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                  previewTheme === 'slate'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Pratinjau Latar Gelap Standar"
              >
                Standar
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('ultra')}
                className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                  previewTheme === 'ultra'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Pratinjau Mode Malam / Kontras Tinggi"
              >
                Kontras
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('transparent')}
                className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                  previewTheme === 'transparent'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Pratinjau Latar Transparan"
              >
                Transparan
              </button>
            </div>
          </div>

          {/* Interactive Simulation Window */}
          <div
            className={`rounded-lg p-3 transition-all border ${
              previewTheme === 'ultra'
                ? 'bg-black/95 border-white/30 shadow-inner'
                : previewTheme === 'transparent'
                ? 'bg-slate-950/40 border-slate-800/70'
                : 'bg-slate-900/90 border-slate-800 shadow-md'
            }`}
          >
            <div
              className="space-y-1 transition-all"
              style={{
                fontFamily: activeFont.cssFamily,
                letterSpacing: activeFont.letterSpacing || 'normal',
                color: settings.textColor || '#ffffff',
                textShadow:
                  settings.textShadow || previewTheme === 'ultra'
                    ? '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)'
                    : 'none',
                fontSize:
                  settings.textSize === 'small'
                    ? '0.82rem'
                    : settings.textSize === 'large'
                    ? '1.05rem'
                    : '0.92rem',
              }}
            >
              {settings.customHeader ? (
                <div className="font-semibold text-sky-300 text-[0.95em]">
                  {settings.customHeader}
                </div>
              ) : (
                <div className="font-semibold text-sky-300 text-[0.95em]">
                  DOKUMENTASI LAPANGAN RESMI
                </div>
              )}

              {/* Timestamp Date & Time */}
              <div className="font-normal opacity-95">
                21/10/2026 14:05:40 {settings.timezone || 'WIB'}
              </div>

              {/* Coordinates */}
              <div className="font-normal opacity-90">
                {settings.coordinateFormat === 'dms'
                  ? `7°19'44.2" S 112°45'03.2" E`
                  : `-7,328954 112,750881`}
              </div>

              {/* Address */}
              <div className="font-normal opacity-90">
                Jl. Barata Jaya No. 42, Gubeng, Surabaya, Jawa Timur
              </div>

              {/* Custom subtext / note */}
              <div className="text-emerald-300 font-normal">
                {settings.customSubtext || 'Proyek: Konstruksi Tahap II | Petugas: Ir. Hendra S.'}
              </div>
            </div>
          </div>

          {/* Active Font Details Footer */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{activeFont.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-300">{activeFont.category}</span>
            </div>
            <div className="text-slate-500 italic">
              Cocok untuk: {activeFont.recommendedFor}
            </div>
          </div>
        </div>
      )}

      {/* 2. GRID OF SELECTABLE FONT CARDS */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-medium text-slate-400 flex items-center justify-between">
          <span>Pilih Koleksi Gaya Font:</span>
          <span className="text-slate-500 text-[9px]">{FONT_STYLE_OPTIONS.length} Pilihan Font</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {FONT_STYLE_OPTIONS.map((font) => {
            const isSelected = (settings.fontFamily || 'mono') === font.id;

            return (
              <button
                key={font.id}
                type="button"
                onClick={() => handleSelectFont(font.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/50 text-white shadow-lg ring-1 ring-sky-400/60'
                    : 'border-slate-800 bg-slate-900/70 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Header Row: Name & Active Badge */}
                <div className="flex items-start justify-between w-full gap-1.5">
                  <div>
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                      <span>{font.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-sky-400/90 font-medium mt-0.5">
                      {font.category}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold transition-all ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {isSelected ? 'Dipilih' : font.badge}
                    </span>
                  </div>
                </div>

                {/* Live Sample Line rendered in THIS specific font */}
                <div
                  className={`p-2 rounded-lg border transition-all text-xs overflow-hidden ${
                    isSelected
                      ? 'bg-slate-950/90 border-sky-500/40 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  }`}
                  style={{
                    fontFamily: font.cssFamily,
                    letterSpacing: font.letterSpacing || 'normal',
                  }}
                >
                  <div className="truncate font-semibold">{font.sampleText}</div>
                  <div className="text-[10px] opacity-75 truncate mt-0.5">
                    ABCDEFGHIJKLM 1234567890
                  </div>
                </div>

                {/* Description */}
                <div className="text-[10px] text-slate-400 leading-tight">
                  {font.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
