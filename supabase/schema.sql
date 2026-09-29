-- ============================================================
-- SMARTFLOW — SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- TABLE: pipelines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    leak_threshold NUMERIC DEFAULT 1.0,
    status TEXT DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: devices
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'OFFLINE',
    last_seen TIMESTAMPTZ,
    firmware_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: sensor_readings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    pipeline_id TEXT NOT NULL,
    flow_in NUMERIC NOT NULL,
    flow_out NUMERIC NOT NULL,
    difference NUMERIC NOT NULL,
    status TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: leak_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leak_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    device_id TEXT NOT NULL,
    pipeline_id TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    flow_in NUMERIC,
    flow_out NUMERIC,
    difference NUMERIC,
    estimated_loss NUMERIC DEFAULT 0,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_name TEXT DEFAULT 'SmartFlow Pipeline',
    leak_threshold NUMERIC DEFAULT 1.0,
    refresh_interval INTEGER DEFAULT 5,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme TEXT DEFAULT 'dark',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DATABASE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_id ON public.sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_pipeline_id ON public.sensor_readings(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_status ON public.sensor_readings(status);

CREATE INDEX IF NOT EXISTS idx_leak_events_start_time ON public.leak_events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_leak_events_pipeline_id ON public.leak_events(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_leak_events_status ON public.leak_events(status);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_pipeline_id ON public.pipelines(pipeline_id);

-- ============================================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pipelines_updated_at ON public.pipelines;
CREATE TRIGGER set_pipelines_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_devices_updated_at ON public.devices;
CREATE TRIGGER set_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_sensor_readings_updated_at ON public.sensor_readings;
CREATE TRIGGER set_sensor_readings_updated_at BEFORE UPDATE ON public.sensor_readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_leak_events_updated_at ON public.leak_events;
CREATE TRIGGER set_leak_events_updated_at BEFORE UPDATE ON public.leak_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leak_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public access for reading and writing in prototype monitoring mode
CREATE POLICY "Allow public select pipelines" ON public.pipelines FOR SELECT USING (true);
CREATE POLICY "Allow public insert pipelines" ON public.pipelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pipelines" ON public.pipelines FOR UPDATE USING (true);

CREATE POLICY "Allow public select devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Allow public insert devices" ON public.devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update devices" ON public.devices FOR UPDATE USING (true);

CREATE POLICY "Allow public select sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert sensor_readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select leak_events" ON public.leak_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert leak_events" ON public.leak_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update leak_events" ON public.leak_events FOR UPDATE USING (true);

CREATE POLICY "Allow public select settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings" ON public.settings FOR UPDATE USING (true);

-- ============================================================
-- ENABLE SUPABASE REALTIME
-- ============================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.sensor_readings, public.leak_events, public.pipelines, public.devices;
COMMIT;
