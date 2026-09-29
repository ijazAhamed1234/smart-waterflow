# SmartFlow — Smart Water Pipeline Monitoring & Leak Detection System

SmartFlow is an industrial-grade, real-time smart water pipeline monitoring and leak detection web application built with **Next.js**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Supabase PostgreSQL**, and **Supabase Realtime**.

---

## 🏗 System Architecture

```
                 ┌───────────────────────┐
                 │    SmartFlow UI       │
                 │ Dashboard             │
                 │ Live Monitoring       │
                 │ Sensors & Leaks       │
                 │ Analytics             │
                 └───────────┬───────────┘
                             │ Supabase Realtime / HTTP API
                 ┌───────────▼───────────┐
                 │   Next.js Backend     │
                 │ Route Handlers        │
                 │ Leak Detection Logic  │
                 │ Server Health Check   │
                 └───────────┬───────────┘
                             │ @supabase/supabase-js
                 ┌───────────▼───────────┐
                 │  Supabase PostgreSQL  │
                 │                       │
                 │ pipelines             │
                 │ devices               │
                 │ sensor_readings       │
                 │ leak_events           │
                 │ settings              │
                 └───────────────────────┘
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Setup Supabase PostgreSQL Database

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Run the SQL schema script in [`supabase/schema.sql`](supabase/schema.sql) to create all tables, indexes, RLS policies, and enable Supabase Realtime.
4. Run the seed script in [`supabase/seed.sql`](supabase/seed.sql) to populate initial demonstration data.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔌 API Routes

- `GET /api/health` — Checks API state and Supabase PostgreSQL connection status.
- `GET /api/dashboard` — Aggregates live system status, latest flow reading, active/recent leaks, and 30-min flow history.
- `GET /api/sensors` — Retrieves historical sensor readings from Supabase.
- `POST /api/sensors` — Receives sensor readings (`flowIn`, `flowOut`), calculates flow difference on the server, evaluates leak status against pipeline threshold, and manages `leak_events` lifecycle.
- `GET /api/sensors/latest` — Fetches the single latest sensor reading.
- `GET /api/leaks` — Retrieves all recorded leak events.
- `GET /api/leaks/[id]` — Fetches details for a specific leak event.
- `GET /api/pipelines` & `PATCH /api/pipelines/[id]` — Manages pipeline configurations.
- `GET /api/devices` & `POST /api/devices` — Manages connected IoT devices.
- `GET /api/settings` & `PATCH /api/settings` — Manages application preferences.
- `GET /api/analytics` — Server-calculated analytics (average flow rates, total leaks, estimated water loss, daily trends).
- `POST /api/seed` — Endpoint to seed initial sample records.

---

## 📡 Future ESP32 Hardware Integration

The backend is prepared for direct HTTP `POST` requests from ESP32 microcontrollers:

**Endpoint:** `POST /api/sensors`  
**Payload Format:**
```json
{
  "deviceId": "ESP32-001",
  "pipelineId": "PIPE-001",
  "flowIn": 8.5,
  "flowOut": 5.5
}
```

The Next.js backend calculates `difference = Math.max(flowIn - flowOut, 0)`, checks `leak_threshold`, inserts a row into `sensor_readings`, updates `devices.last_seen`, and streams updates to the frontend via Supabase Realtime.
