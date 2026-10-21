import { StampSettings, SettingsPreset } from '../types/stamp';

const LOCAL_STORAGE_KEY = 'gps_camera_settings_v3';
const LOCAL_PRESETS_KEY = 'gps_camera_presets_v1';

export interface DatabaseStatus {
  connected: boolean;
  engine: string;
  path: string;
  sizeBytes?: number;
  updatedAt?: string | null;
  error?: string;
}

/**
 * Fetch settings from SQLite backend with fallback to localStorage
 */
export async function loadSettingsFromDatabase(
  defaultSettings: StampSettings
): Promise<{ settings: StampSettings; fromDb: boolean }> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        // Merge with defaultSettings to ensure all fields exist
        const merged: StampSettings = {
          ...defaultSettings,
          ...data.settings,
        };
        // Also cache locally
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore localStorage quota
        }
        return { settings: merged, fromDb: true };
      }
    }
  } catch (err) {
    console.warn('SQLite server fetch failed, using local cache:', err);
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        settings: { ...defaultSettings, ...parsed },
        fromDb: false,
      };
    }
  } catch {
    // ignore
  }

  return { settings: defaultSettings, fromDb: false };
}

/**
 * Persist settings to SQLite database backend and local cache
 */
export async function saveSettingsToDatabase(
  settings: StampSettings
): Promise<{ success: boolean; persistedToSQLite: boolean }> {
  // 1. Immediately cache locally for fast offline access
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }

  // 2. Persist to SQLite backend
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, persistedToSQLite: Boolean(data.success) };
    }
  } catch (err) {
    console.warn('Failed to sync settings to SQLite server:', err);
  }

  return { success: true, persistedToSQLite: false };
}

/**
 * Load saved presets from SQLite
 */
export async function loadPresetsFromDatabase(): Promise<SettingsPreset[]> {
  try {
    const res = await fetch('/api/presets');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.presets)) {
        try {
          localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(data.presets));
        } catch {
          // ignore
        }
        return data.presets;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch presets from SQLite:', err);
  }

  // Local fallback
  try {
    const local = localStorage.getItem(LOCAL_PRESETS_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Save or update a preset in SQLite
 */
export async function savePresetToDatabase(
  name: string,
  config: Partial<StampSettings>,
  isDefault = false,
  existingId?: string
): Promise<SettingsPreset | null> {
  const payload = {
    id: existingId,
    name,
    is_default: isDefault,
    config,
  };

  try {
    const res = await fetch('/api/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      const newPreset: SettingsPreset = {
        id: data.id,
        name,
        is_default: isDefault,
        config,
        updated_at: new Date().toISOString(),
      };
      return newPreset;
    }
  } catch (err) {
    console.warn('Failed to save preset to SQLite:', err);
  }

  // Local fallback
  const fallbackPreset: SettingsPreset = {
    id: existingId || 'preset_local_' + Date.now(),
    name,
    is_default: isDefault,
    config,
    updated_at: new Date().toISOString(),
  };

  try {
    const current = await loadPresetsFromDatabase();
    const updated = [
      ...current.filter((p) => p.id !== fallbackPreset.id),
      fallbackPreset,
    ];
    localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return fallbackPreset;
}

/**
 * Delete a preset from SQLite
 */
export async function deletePresetFromDatabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/presets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Failed to delete preset from SQLite:', err);
  }

  // Local fallback
  try {
    const current = await loadPresetsFromDatabase();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }

  return true;
}

/**
 * Save custom logo into SQLite media_blobs
 */
export async function saveLogoToDatabase(
  base64Data: string,
  name = 'logo.png',
  mimeType = 'image/png'
): Promise<boolean> {
  try {
    const res = await fetch('/api/logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64_data: base64Data,
        name,
        mime_type: mimeType,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save logo to SQLite:', err);
    return false;
  }
}

/**
 * Get active SQLite database metadata info
 */
export async function getDatabaseInfo(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/database/info');
    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        engine: data.engine || 'SQLite 3 (WASM)',
        path: data.path || 'data/settings.sqlite',
        sizeBytes: data.sizeBytes,
        updatedAt: data.updatedAt,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      engine: 'SQLite 3 (Offline / Local)',
      path: 'localStorage Cache',
      error: err?.message,
    };
  }

  return {
    connected: false,
    engine: 'SQLite 3 (Offline)',
    path: 'local',
  };
}
