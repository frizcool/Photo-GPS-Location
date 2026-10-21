# GPS Timestamp Camera: SQLite Configuration Persistence & Reference Compass/Map Design

Implementation plan for integrating an SQLite database engine to persist user configurations (custom text formats, logo, presets, night mode, timestamp styling) and redesigning the live viewfinder and canvas photo watermark to match the reference compass and map format.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions synthesize the user's requirements and clarifying responses:

- **Confirmed Decision 1 (SQLite Architecture)**: Full-stack persistence powered by an Express server (`server.ts`) hosting an SQLite database file (`data/settings.sqlite`). Provides standard REST endpoints (`/api/settings`, `/api/presets`, `/api/logo`) with automatic client-side offline caching so field photography functions seamlessly without connection interruptions.
- **Confirmed Decision 2 (Data Coverage)**: Complete persistence of all configuration properties:
  - Custom logo (image data URL/base64, dimensions, opacity, positioning)
  - Text typography & format (date format DD/MM/YYYY vs MM/DD/YYYY, time format 24h/12h, custom prefixes/notes, font size, text shadow/contrast)
  - Night mode exposure compensation and high-contrast overlay settings
  - Compass display modes (bearing, cardinal points, heading degrees)
  - Mini map zoom, map style (streets, satellite, terrain), and position
  - Named preset configurations (e.g., "Survey Pro", "Field Inspection", "Clean Stamp")
- **Confirmed Decision 3 (Reference Compass & Map Replicas)**:
  - **Compass**: Circular dark translucent outer band (`rgba(30, 35, 45, 0.75)` with subtle hairline border), bold crisp white cardinal letters (N, E, S, W) centered inside the ring, precision cyan needle pointer indicating orientation, and degree readout (`142° SE`).
  - **Mini Map**: Framed coordinate mini map with rounded corners (`rounded-lg`), subtle drop shadow, location pin/reticle, and street map tiles matching the reference format.
  - **Telemetry Stamping**: Clean tabular monospace metadata block (`tabular-nums`) displaying ISO/custom date-time, decimal & DMS coordinates, street address, altitude, and note annotations with high-contrast text outlines for legibility against any background.

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades the GPS Timestamp Camera application into an enterprise-ready field recording tool with persistent SQLite storage for all customization settings and an authentic surveyor-grade overlay mirroring the user's reference photograph.
- **Target Audience / Persona**: Field engineers, surveyors, construction supervisors, insurance inspectors, and outdoor professionals who require durable, tamper-evident, geotagged photo documentation with standardized corporate branding and reproducible settings across browser refreshes and sessions.
- **Key Value**: Guarantees zero loss of configured logos, notes, and custom date/coordinate formats upon reloading or restarting, while delivering an attractive, legibility-tested compass and map watermark layout.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Camera Viewfinder & Stamped HUD**:
   - The user opens the camera or loads a photo.
   - The bottom HUD displays the new reference compass (dark ring, bold cardinal markers, cyan needle), the synchronized mini map tile, and the crisp monospace timestamp and coordinate readout.
   - In low-light environments, engaging Night Mode instantly adjusts exposure and enhances HUD contrast with a dark translucent backdrop scrim.
2. **Settings Customization & SQLite Auto-Save**:
   - The user opens Settings to select date format (e.g., `DD/MM/YYYY HH:mm:ss`), customize field notes/project names, or upload a company logo.
   - As settings change, an active sync badge indicates persistence to SQLite.
   - Switching presets (e.g., "Field Inspection", "Standard GPS") instantly swaps full configuration sets stored in SQLite.
3. **Photo Capture & Stamped Export**:
   - Clicking Capture generates a high-resolution stamped image where both the HUD overlay and the HTML5 canvas burn-in render the exact reference compass, map, and metadata.
   - Stored in the local SQLite/IndexedDB gallery for viewing and instant download.

#### Visual Identity & Theme
- **Aesthetic Direction**: Tactical, high-contrast, utilitarian surveyor instrumentation.
- **Color Palette**:
  - Neutral Canvas: Deep dark slate `#0f172a` and charcoal `#1e293b`.
  - Accent Colors: Vivid cyan `#06b6d4` (compass needle & active coordinates) and safety amber `#f59e0b` (mode indicators).
  - Telemetry Text: Pure white `#ffffff` with subtle `1px` dark stroke / shadow for outdoors visibility.
- **Typography**:
  - Primary UI: System modern sans-serif (`Inter` / `Plus Jakarta Sans`) for modals and controls.
  - Watermark & HUD: `font-mono tabular-nums` for rock-solid vertical alignment of latitude, longitude, altitude, and date-times.
- **Touch Ergonomics**: All interactive buttons, mode toggles, and modal triggers maintain $\ge 44 \times 44\text{px}$ touch hitboxes adhering to mobile touch guidelines.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: SQLite Server-Side Integration via Express (`server.ts`)**
  - *Chosen Approach*: Transition dev/prod runtime to Express (`tsx server.ts`) serving Vite middleware in development and static assets in production, housing an SQLite database via file storage (`data/settings.sqlite`).
  - *Why*: Provides robust, durable file-based SQL storage (`data/settings.sqlite`) that survives browser clear-cache actions, exports easily, and aligns with the user's explicit preference.
  - *Offline Fallback*: The client maintains a synchronized copy in `localStorage`/`IndexedDB` so the camera continues capturing and storing photos even when disconnected.
- **Decision 2: Unified Drawing Pipeline between Live HUD and Canvas Stamp**
  - *Chosen Approach*: Share layout math, compass geometry, and SVG/Canvas drawing functions between `CompassDial.tsx` / `TimestampOverlay.tsx` (React DOM HUD) and `canvasStamp.ts` (Canvas 2D export).
  - *Why*: Guarantees that what the user previews on screen is 100% identical to the exported JPEG photo file.
- **Decision 3: Dual Format Customization**
  - *Chosen Approach*: Provide structured selectors for Date Format (`DD/MM/YYYY`, `YYYY-MM-DD`, `DD MMMM YYYY`), Time Format (`24h` vs `12h AM/PM`), Coordinate Display (`Decimal Degrees` vs `Degrees Minutes Seconds`), and Freeform Project Text.
  - *Why*: Field compliance demands different formats depending on regional and industry standards (government surveys vs architectural reports).

---

### 4. Technical Architecture & Data Strategy

#### System & Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Viewport                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ CameraView (MediaStream Video / Uploaded Image)     │   │
│   │                                                     │   │
│   │  ┌───────────────────────────────────────────────┐  │   │
│   │  │ Live HUD Overlay (TimestampOverlay.tsx)       │  │   │
│   │  │  ┌─────────────────┐ ┌─────────┐ ┌──────────┐ │  │   │
│   │  │  │ ReferenceCompass│ │ MiniMap │ │ Monospace│ │  │   │
│   │  │  │ (Dark Ring+Cyan)│ │  Tile   │ │ Telemetry│ │  │   │
│   │  │  └─────────────────┘ └─────────┘ └──────────┘ │  │   │
│   │  └───────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌──────────────────┐ ┌────────────────┐ ┌─────────────┐   │
│   │ CameraControls   │ │ SettingsModal  │ │ PresetBar   │   │
│   └─────────┬────────┘ └───────┬────────┘ └──────┬──────┘   │
└─────────────┼──────────────────┼─────────────────┼──────────┘
              │                  │                 │           
              ▼                  ▼                 ▼           
┌─────────────────────────────────────────────────────────────┐
│               Client Data Sync & Cache Layer                │
│             (useSettings hook + Offline Cache)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST: /api/settings, /api/presets
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Node.js / Express Server (server.ts)            │
│  - GET /api/settings     - POST /api/settings               │
│  - GET /api/presets      - POST /api/presets                │
│  - POST /api/upload-logo - GET /api/health                  │
├─────────────────────────────────────────────────────────────┤
│                 SQLite Database Engine                      │
│                (data/settings.sqlite)                       │
│  - Table: app_settings (key TEXT PRIMARY KEY, value TEXT)   │
│  - Table: presets (id TEXT PRIMARY KEY, name TEXT, config)  │
│  - Table: media_blobs (id TEXT PRIMARY KEY, type, data)     │
└─────────────────────────────────────────────────────────────┘
```

#### SQLite Data Schema
```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  settings_json TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  config_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_blobs (
  id TEXT PRIMARY KEY,
  name TEXT,
  mime_type TEXT,
  base64_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Step-by-Step Implementation Sequence
1. **Server & Database Infrastructure**:
   - Setup `server.ts` running Express on port 3000 with Vite middleware in development mode (`"dev": "tsx server.ts"`).
   - Initialize SQLite database with auto-migrated tables for settings, presets, and media assets.
   - Implement clean REST endpoints for loading and persisting configuration.
2. **Reference Compass Redesign**:
   - Re-engineer `CompassDial.tsx` to match the exact visual style of the reference image: dark translucent circular bezel, crisp bold cardinal marks (N, E, S, W), needle dial with cyan indicator, and degree badge.
   - Port identical vector rendering logic into `canvasStamp.ts` so exported photos reflect the same compass aesthetic.
3. **Mini Map & Telemetry HUD Layout**:
   - Position and format the mini map tile with sleek border radius and coordinate reticle.
   - Structure the telemetry text block with modular customizable formatting (date/time formats, custom title/project prefix, coordinates, elevation, street address).
4. **Settings & Preset UI Integration**:
   - Add intuitive controls in `SettingsModal.tsx` for date/time format selection, custom text format string, logo management, and night mode defaults.
   - Add Preset Management (save current configuration as a preset, load preset, reset to defaults).
5. **Verification & Regression Testing**:
   - Verify that configuration changes persist immediately in SQLite and restore on page refresh.
   - Verify camera capture and photo stamp output matching the reference image.
   - Execute `compile_applet` and `lint_applet` to confirm clean build.
