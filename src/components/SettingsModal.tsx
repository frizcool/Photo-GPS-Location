import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Compass,
  Map as MapIcon,
  Sliders,
  RotateCcw,
  Navigation,
  Check,
  FileText,
  User,
  Moon,
  Sun,
  Calendar,
  Type,
  Sparkles,
  Database,
  Save,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Layout,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
} from 'lucide-react';
import { StampLocation, StampSettings, TimezoneOption, SettingsPreset, StampPlacement } from '../types/stamp';
import { PRESET_LOCATIONS, reverseGeocode, formatIndonesianDate } from '../utils/geo';
import { FontStyleSelector } from './FontStyleSelector';
import {
  loadPresetsFromDatabase,
  savePresetToDatabase,
  deletePresetFromDatabase,
  getDatabaseInfo,
  DatabaseStatus,
} from '../utils/sqliteStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: StampLocation;
  onLocationChange: (loc: StampLocation) => void;
  settings: StampSettings;
  onSettingsChange: (settings: StampSettings) => void;
  onRefreshGps: () => void;
  isGpsLoading: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  location,
  onLocationChange,
  settings,
  onSettingsChange,
  onRefreshGps,
  isGpsLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'address' | 'timestamp' | 'watermark' | 'database'>('address');
  const [presets, setPresets] = useState<SettingsPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [dbActionMsg, setDbActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPresetsFromDatabase().then(setPresets);
      getDatabaseInfo().then(setDbStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: (typeof PRESET_LOCATIONS)[0]) => {
    onLocationChange({
      ...location,
      ...preset.location,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">
              Pengaturan Timestamp & Lokasi
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'address'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Alamat & Koordinat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timestamp')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'timestamp'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Waktu & Format
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watermark')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'watermark'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Tampilan & Catatan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Basis Data SQLite & Preset
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-xs">
          {activeTab === 'address' && (
            <div className="space-y-4">
              {/* 2 OPSI LOKASI: GPS ASLI DEVICE vs LOKASI KUSTOM */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold text-xs">
                  Pilih Mode Sumber Lokasi (2 Opsi):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Opsi 1: Lokasi Asli Device */}
                  <button
                    type="button"
                    onClick={() => {
                      onSettingsChange({ ...settings, locationMode: 'device' });
                      onRefreshGps();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      settings.locationMode === 'device'
                        ? 'border-blue-500 bg-blue-950/40 text-white shadow-md ring-1 ring-blue-500/50'
                        : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <Navigation className="w-4 h-4" />
                      </div>
                      {settings.locationMode === 'device' && (
                        <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">1. Lokasi Asli Device</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Otomatis dari sensor GPS perangkat & alamat asli
                      </div>
                    </div>
                  </button>

                  {/* Opsi 2: Lokasi Kustom */}
                  <button
                    type="button"
                    onClick={() => {
                      onSettingsChange({ ...settings, locationMode: 'custom' });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      settings.locationMode === 'custom'
                        ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      {settings.locationMode === 'custom' && (
                        <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">2. Lokasi Kustom</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Bebas ketik alamat, pilih RS/Monas, atau koordinat
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status Banner when Device GPS is Active */}
              {settings.locationMode === 'device' ? (
                <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span>GPS Device Aktif</span>
                    </div>
                    <button
                      type="button"
                      disabled={isGpsLoading}
                      onClick={onRefreshGps}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className={`w-3 h-3 ${isGpsLoading ? 'animate-spin' : ''}`} />
                      {isGpsLoading ? 'Memperbarui...' : 'Sinkronkan GPS'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Posisi: <strong className="text-white">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</strong>
                    {location.accuracy && ` (Akurasi: ±${location.accuracy}m)`}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {location.street}, {location.district}, {location.city}
                  </p>
                </div>
              ) : (
                /* Preset quick picks when Custom is Active */
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    Pilih Cepat Lokasi Preset:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {PRESET_LOCATIONS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                          location.city === preset.location.city &&
                          location.suburb === preset.location.suburb
                            ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold'
                            : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{preset.name}</span>
                        {location.city === preset.location.city &&
                          location.suburb === preset.location.suburb && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Fields */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="font-semibold text-white">Edit Rincian Alamat (Teks Overlay):</div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.latitude}
                      onChange={(e) =>
                        onLocationChange({ ...location, latitude: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.longitude}
                      onChange={(e) =>
                        onLocationChange({ ...location, longitude: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Jalan / Gedung</label>
                  <input
                    type="text"
                    value={location.street}
                    onChange={(e) =>
                      onLocationChange({ ...location, street: e.target.value })
                    }
                    placeholder="Contoh: Jalan Rungkut Industri I No.1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Kelurahan / Desa</label>
                    <input
                      type="text"
                      value={location.suburb}
                      onChange={(e) =>
                        onLocationChange({ ...location, suburb: e.target.value })
                      }
                      placeholder="Contoh: Kendangsari"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={location.district}
                      onChange={(e) =>
                        onLocationChange({ ...location, district: e.target.value })
                      }
                      placeholder="Contoh: Kecamatan Tenggilis Mejoyo"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={location.city}
                      onChange={(e) =>
                        onLocationChange({ ...location, city: e.target.value })
                      }
                      placeholder="Contoh: Surabaya"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Provinsi</label>
                    <input
                      type="text"
                      value={location.province}
                      onChange={(e) =>
                        onLocationChange({ ...location, province: e.target.value })
                      }
                      placeholder="Contoh: Jawa Timur"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timestamp' && (
            <div className="space-y-4">
              {/* Live Preview Box */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-500/30 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Preview Format Timestamp:
                  </span>
                  <span className="text-[10px] text-slate-500">Hasil Nyata</span>
                </div>
                <div className="p-2.5 bg-black/60 rounded-lg text-white font-mono text-xs sm:text-sm tracking-wide border border-white/10 break-all">
                  {formatIndonesianDate(
                    new Date(),
                    settings.timezone,
                    settings.useRealTime ? undefined : settings.customTime,
                    settings.useRealTime ? undefined : settings.customDate,
                    {
                      dateFormat: settings.dateFormat,
                      timeFormat: settings.timeFormat,
                      showDayName: settings.showDayName,
                    }
                  )}
                </div>
              </div>

              {/* Format Tanggal (DD/MM/YYYY vs MM/DD/YYYY vs Standar) */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Format Tanggal Timestamp:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'full_id', label: '19 Oktober 2026', desc: 'Standar Lengkap Indonesia' },
                    { id: 'DD/MM/YYYY', label: '19/10/2026', desc: 'DD/MM/YYYY (Indonesia)' },
                    { id: 'MM/DD/YYYY', label: '10/19/2026', desc: 'MM/DD/YYYY (Format US)' },
                    { id: 'YYYY-MM-DD', label: '2026-10-19', desc: 'YYYY-MM-DD (Format ISO)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          dateFormat: fmt.id as StampSettings['dateFormat'],
                        })
                      }
                      className={`p-2 rounded-xl border text-left transition-all ${
                        settings.dateFormat === fmt.id
                          ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="font-mono text-xs text-white">{fmt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Tampilkan Nama Hari */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-xs">Sertakan Nama Hari</span>
                  <span className="text-[10px] text-slate-400">
                    Contoh: &quot;Senin, 19 Oktober 2026&quot; vs &quot;19 Oktober 2026&quot;
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showDayName ?? true}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, showDayName: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded-sm accent-blue-500 cursor-pointer"
                />
              </label>

              {/* Format Jam (24 Jam vs 12 Jam AM/PM) */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Format Jam & Waktu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, timeFormat: '24h' })}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      settings.timeFormat === '24h'
                        ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                        : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-mono text-xs text-white">24 Jam (16:05:40)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Format Militer / Standar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, timeFormat: '12h' })}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      settings.timeFormat === '12h'
                        ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                        : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-mono text-xs text-white">12 Jam (04:05:40 PM)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Format AM / PM</div>
                  </button>
                </div>
              </div>

              {/* Mode Realtime vs Kustom */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Sumber Waktu (Realtime / Kustom):
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, useRealTime: true })}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      settings.useRealTime
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold'
                        : 'border-slate-800 bg-slate-800 text-slate-400'
                    }`}
                  >
                    Waktu Realtime (Otomatis)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, useRealTime: false })}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      !settings.useRealTime
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold'
                        : 'border-slate-800 bg-slate-800 text-slate-400'
                    }`}
                  >
                    Waktu Kustom
                  </button>
                </div>
              </div>

              {!settings.useRealTime && (
                <div className="p-3 bg-slate-800/70 rounded-xl space-y-2 border border-slate-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Tanggal Kustom</label>
                      <input
                        type="date"
                        value={settings.customDate || '2026-10-18'}
                        onChange={(e) =>
                          onSettingsChange({ ...settings, customDate: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Jam Kustom</label>
                      <input
                        type="time"
                        step="1"
                        value={settings.customTime || '16:05:40'}
                        onChange={(e) =>
                          onSettingsChange({ ...settings, customTime: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Zona Waktu */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Zona Waktu:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['WIB', 'WITA', 'WIT', 'AUTO'] as TimezoneOption[]).map((tz) => (
                    <button
                      key={tz}
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, timezone: tz })}
                      className={`py-1.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                        settings.timezone === tz
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ukuran Teks Cap */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Ukuran Teks Cap:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, textSize: sz })}
                      className={`py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        settings.textSize === sz
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sz === 'small' ? 'Kecil' : sz === 'medium' ? 'Sedang' : 'Besar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* GAYA FONT STEMPEL WAKTU & PRATINJAU */}
              <div className="pt-2 border-t border-slate-800">
                <FontStyleSelector
                  settings={settings}
                  onSettingsChange={onSettingsChange}
                  showFullPreview={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="space-y-4">
              {/* FITUR MODE MALAM (NIGHT MODE / LOW LIGHT BOOST) */}
              <div className="p-3.5 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white shadow-md">
                      <Moon className="w-4 h-4 text-indigo-200" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                        Mode Malam (Night Mode / Low-Light)
                        {settings.nightMode && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-indigo-500 text-white font-bold">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Penyesuaian eksposur & kontras tinggi saat cahaya minim
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.nightMode}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, nightMode: e.target.checked })
                    }
                    className="w-5 h-5 text-indigo-600 rounded-md accent-indigo-500 cursor-pointer"
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
                  🌙 <strong>Eksposur Ditingkatkan (+35%)</strong> untuk mencerahkan subjek foto dalam kondisi remang-remang, serta melengkapi teks timestamp dengan <strong>pelat kontras tinggi (backdrop)</strong> agar angka dan alamat selalu tajam & mudah dibaca.
                </p>

                {settings.nightMode && (
                  <div className="pt-2 border-t border-indigo-900/60 space-y-1.5">
                    <label className="block text-[11px] text-indigo-200 font-medium">
                      Pilihan Tingkat Kontras Pelat Timestamp:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onSettingsChange({ ...settings, nightModeContrast: 'high' })
                        }
                        className={`p-2 rounded-lg border text-left transition-all ${
                          settings.nightModeContrast === 'high'
                            ? 'border-indigo-400 bg-indigo-950/70 text-indigo-200 ring-1 ring-indigo-400'
                            : 'border-slate-800 bg-slate-800/60 text-slate-400'
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">High Contrast</div>
                        <div className="text-[10px] text-slate-400">Semi-transparan elegan</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSettingsChange({ ...settings, nightModeContrast: 'ultra' })
                        }
                        className={`p-2 rounded-lg border text-left transition-all ${
                          settings.nightModeContrast === 'ultra'
                            ? 'border-white bg-black text-white ring-1 ring-white'
                            : 'border-slate-800 bg-slate-800/60 text-slate-400'
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">Ultra Solid</div>
                        <div className="text-[10px] text-slate-400">Hitam pekat border tajam</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TEKS KUSTOM TAMBAHAN (SELAIN CATATAN) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-sky-400" />
                  <span>Kustomisasi Teks Tambahan:</span>
                </div>

                {/* Custom Header (Baris Atas) */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Teks Kustom Baris Atas (Header Tambahan)
                  </label>
                  <input
                    type="text"
                    value={settings.customHeader || ''}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, customHeader: e.target.value })
                    }
                    placeholder="Contoh: RS ROYAL SURABAYA / UNIT RAWAT INAP"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Akan ditampilkan di baris paling atas sebelum timestamp waktu.
                  </span>
                </div>

                {/* Watermark Note (Catatan Standar) */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Catatan Khusus / Status Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={settings.watermarkNote || ''}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, watermarkNote: e.target.value })
                    }
                    placeholder="Contoh: Absensi Hadir, Rawat Inap, Inspeksi Lapangan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>

                {/* Custom Subtext (Baris Bawah) */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Teks Kustom Baris Bawah (Subtext Tambahan)
                  </label>
                  <input
                    type="text"
                    value={settings.customSubtext || ''}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, customSubtext: e.target.value })
                    }
                    placeholder="Contoh: Kondisi Fisik: 100% Selesai | Shift 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Teks kustom pelengkap selain catatan dan nama petugas.
                  </span>
                </div>

                {/* Nama Proyek & Pegawai */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Nama Proyek</label>
                    <input
                      type="text"
                      value={location.projectName || ''}
                      onChange={(e) =>
                        onLocationChange({ ...location, projectName: e.target.value })
                      }
                      placeholder="Contoh: Renovasi Gedung B"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Nama Petugas</label>
                    <input
                      type="text"
                      value={location.userName || ''}
                      onChange={(e) =>
                        onLocationChange({ ...location, userName: e.target.value })
                      }
                      placeholder="Contoh: Dr. Budi / Ahmad"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* ELEMEN OVERLAY TAMPIL */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-semibold text-white">Elemen Overlay Tampil:</div>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span>Kompas Arah (Pojok Kiri Atas)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showCompass}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, showCompass: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-emerald-400" />
                    <span>Peta Mini Google (Pojok Kiri Bawah)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showMap}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, showMap: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                </label>

                {/* Map Opacity / Transparency Slider */}
                {settings.showMap && (
                  <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>Transparansi / Opacity Peta:</span>
                      <span className="font-mono text-blue-400 font-bold">
                        {Math.round((settings.mapOpacity ?? 0.85) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={settings.mapOpacity ?? 0.85}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          mapOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer h-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Lebih Transparan</span>
                      <span>Solid / Jelas</span>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Koordinat Latitude & Longitude</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showCoordinates}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, showCoordinates: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Alamat Lengkap (Jalan, Kecamatan, Kota)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showAddress}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, showAddress: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-400" />
                    <span>Logo Pojok Kanan Atas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showLogo}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, showLogo: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                </label>
                {/* GAYA KOMPAS */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    Gaya Desain Kompas:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, compassStyle: 'reference' })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        (settings.compassStyle || 'reference') === 'reference'
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">TimePhoto Referensi</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ring Gelap + Jarum Cyan</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, compassStyle: 'classic' })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        settings.compassStyle === 'classic'
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">Klasik Graduasi</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Dial 360 Derajat</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, compassStyle: 'tactical' })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        settings.compassStyle === 'tactical'
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">Taktis Militer</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Garis Bidik Presisi</div>
                    </button>
                  </div>
                </div>

                {/* FORMAT KOORDINAT */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Format Tampilan Koordinat:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, coordinateFormat: 'decimal' })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        (settings.coordinateFormat || 'decimal') === 'decimal'
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      <div className="font-mono text-xs text-white">-7,328954 112,750881</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Derajat Desimal (Standar)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, coordinateFormat: 'dms' })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        settings.coordinateFormat === 'dms'
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      <div className="font-mono text-xs text-white">7°47'24.4" S 112°45'03.2" E</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">DMS (Derajat Menit Detik)</div>
                    </button>
                  </div>
                </div>

                {/* GAYA FONT STEMPEL WAKTU & PRATINJAU */}
                <div className="pt-2 border-t border-slate-800">
                  <FontStyleSelector
                    settings={settings}
                    onSettingsChange={onSettingsChange}
                    showFullPreview={true}
                  />
                </div>

                {/* POSISI SUDUT INFORMASI CAP (STAMP CORNER PLACEMENT) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-blue-400" />
                      Posisi Sudut Informasi Cap:
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono font-medium px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60">
                      {settings.stampPlacement || 'bottom-right'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    Pilih salah satu dari 4 sudut foto untuk menempatkan blok informasi timestamp, koordinat, dan alamat.
                  </p>

                  {/* Interactive 2x2 corner grid representing the photo layout */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="text-[10px] font-medium text-slate-400 flex items-center justify-between">
                      <span>Pilihan Letak Sudut (4 Posisi):</span>
                      <span className="text-slate-500 text-[9px]">Klik untuk beralih</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. TOP-LEFT */}
                      <button
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, stampPlacement: 'top-left' })}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                          settings.stampPlacement === 'top-left'
                            ? 'border-blue-500 bg-blue-950/60 text-white shadow-md ring-1 ring-blue-500/60'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-1.5 rounded-lg ${settings.stampPlacement === 'top-left' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <ArrowUpLeft className="w-4 h-4" />
                          </div>
                          {settings.stampPlacement === 'top-left' && (
                            <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white">Pojok Kiri Atas</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">top-left</div>
                        </div>
                      </button>

                      {/* 2. TOP-RIGHT */}
                      <button
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, stampPlacement: 'top-right' })}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          settings.stampPlacement === 'top-right'
                            ? 'border-blue-500 bg-blue-950/60 text-white shadow-md ring-1 ring-blue-500/60'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full flex-row-reverse">
                          <div className={`p-1.5 rounded-lg ${settings.stampPlacement === 'top-right' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          {settings.stampPlacement === 'top-right' && (
                            <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white">Pojok Kanan Atas</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">top-right</div>
                        </div>
                      </button>

                      {/* 3. BOTTOM-LEFT */}
                      <button
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, stampPlacement: 'bottom-left' })}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                          settings.stampPlacement === 'bottom-left'
                            ? 'border-blue-500 bg-blue-950/60 text-white shadow-md ring-1 ring-blue-500/60'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-1.5 rounded-lg ${settings.stampPlacement === 'bottom-left' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          {settings.stampPlacement === 'bottom-left' && (
                            <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white">Pojok Kiri Bawah</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">bottom-left</div>
                        </div>
                      </button>

                      {/* 4. BOTTOM-RIGHT */}
                      <button
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, stampPlacement: 'bottom-right' })}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          (!settings.stampPlacement || settings.stampPlacement === 'bottom-right')
                            ? 'border-blue-500 bg-blue-950/60 text-white shadow-md ring-1 ring-blue-500/60'
                            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full flex-row-reverse">
                          <div className={`p-1.5 rounded-lg ${(!settings.stampPlacement || settings.stampPlacement === 'bottom-right') ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <ArrowDownRight className="w-4 h-4" />
                          </div>
                          {(!settings.stampPlacement || settings.stampPlacement === 'bottom-right') && (
                            <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              Aktif (Standar)
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white">Pojok Kanan Bawah</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">bottom-right</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BASIS DATA SQLITE & PRESET */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              {/* STATUS KONEKSI SQLITE */}
              <div className="p-3.5 rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/80 flex items-center justify-center text-white shadow-md">
                      <Database className="w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs flex items-center gap-2">
                        Basis Data SQLite Server
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          Tersambung & Aktif
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Berkas lokal: <code className="text-sky-300 font-mono">data/settings.sqlite</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Database Engine:</span>
                    <span className="font-mono text-white font-medium">SQLite 3 (sql.js WASM)</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ukuran Berkas Database:</span>
                    <span className="font-mono text-white font-medium">
                      {dbStatus?.sizeBytes ? `${Math.round(dbStatus.sizeBytes / 1024)} KB` : 'Aktif'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href="/api/database/download"
                    download="settings.sqlite"
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Cadangan Database (.sqlite)</span>
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      const info = await getDatabaseInfo();
                      setDbStatus(info);
                      setDbActionMsg('Status SQLite diperbarui!');
                      setTimeout(() => setDbActionMsg(null), 2500);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    title="Perbarui status database"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {dbActionMsg && (
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] text-center">
                    {dbActionMsg}
                  </div>
                )}
              </div>

              {/* SIMPAN PRESET BARU */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-850 space-y-3">
                <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-blue-400" />
                  <span>Simpan Pengaturan Saat Ini sebagai Preset Baru</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Contoh: TimePhoto Sesuai Foto, Inspeksi Proyek..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newPresetName.trim()) return;
                      const saved = await savePresetToDatabase(newPresetName.trim(), settings, false);
                      if (saved) {
                        const updated = await loadPresetsFromDatabase();
                        setPresets(updated);
                        setNewPresetName('');
                        setDbActionMsg(`Preset "${saved.name}" berhasil disimpan ke SQLite!`);
                        setTimeout(() => setDbActionMsg(null), 3000);
                      }
                    }}
                    disabled={!newPresetName.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs transition-colors shrink-0 shadow-sm"
                  >
                    Simpan Preset
                  </button>
                </div>
              </div>

              {/* DAFTAR PRESET TERSIMPAN */}
              <div className="space-y-2">
                <div className="font-semibold text-white text-xs flex items-center justify-between">
                  <span>Daftar Preset Tersimpan di SQLite ({presets.length}):</span>
                  <span className="text-[10px] text-slate-400">Klik &quot;Terapkan&quot; untuk memuat</span>
                </div>

                {presets.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-slate-400 text-xs">
                    Belum ada preset tersimpan di database.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-xs flex items-center gap-1.5 truncate">
                            {preset.name}
                            {preset.is_default && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Format: {preset.config.dateFormat || 'DD/MM/YYYY'} · Jam: {preset.config.timeFormat || '24h'} · Kompas: {preset.config.compassStyle || 'reference'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onSettingsChange({
                                ...settings,
                                ...preset.config,
                              });
                              setDbActionMsg(`Pengaturan "${preset.name}" diterapkan!`);
                              setTimeout(() => setDbActionMsg(null), 2500);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium text-[11px] transition-colors"
                          >
                            Terapkan
                          </button>

                          {!preset.is_default && (
                            <button
                              type="button"
                              onClick={async () => {
                                await deletePresetFromDatabase(preset.id);
                                const updated = await loadPresetsFromDatabase();
                                setPresets(updated);
                                setDbActionMsg(`Preset "${preset.name}" dihapus.`);
                                setTimeout(() => setDbActionMsg(null), 2500);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors"
                              title="Hapus preset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
