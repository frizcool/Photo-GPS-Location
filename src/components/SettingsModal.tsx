import React, { useState } from 'react';
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
} from 'lucide-react';
import { StampLocation, StampSettings, TimezoneOption } from '../types/stamp';
import { PRESET_LOCATIONS, reverseGeocode } from '../utils/geo';

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
  const [activeTab, setActiveTab] = useState<'address' | 'timestamp' | 'watermark'>('address');

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
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Mode Jam & Tanggal:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, useRealTime: true })}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      settings.useRealTime
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                        : 'border-slate-800 bg-slate-800 text-slate-400'
                    }`}
                  >
                    Waktu Realtime (Otomatis)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, useRealTime: false })}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      !settings.useRealTime
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300'
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
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tz}
                    </button>
                  ))}
                </div>
              </div>

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
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sz === 'small' ? 'Kecil' : sz === 'medium' ? 'Sedang' : 'Besar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="space-y-4">
              <div className="space-y-2">
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
              </div>

              {/* Custom Watermark Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-semibold text-white">Informasi Tambahan / Pekerjaan:</div>

                <div>
                  <label className="block text-slate-400 mb-1">Catatan Khusus (Optional)</label>
                  <input
                    type="text"
                    value={settings.watermarkNote}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, watermarkNote: e.target.value })
                    }
                    placeholder="Contoh: Absensi Hadir, Rawat Inap, Inspeksi"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nama Petugas / Pegawai</label>
                  <input
                    type="text"
                    value={location.userName || ''}
                    onChange={(e) =>
                      onLocationChange({ ...location, userName: e.target.value })
                    }
                    placeholder="Contoh: Dr. Budi / Ahmad Santoso"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
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
