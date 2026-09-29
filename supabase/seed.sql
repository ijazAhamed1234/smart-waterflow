-- ============================================================
-- SMARTFLOW — SUPABASE SEED DATA
-- ============================================================

-- Clean existing data safely
TRUNCATE TABLE public.sensor_readings, public.leak_events, public.pipelines, public.devices, public.settings CASCADE;

-- Insert Pipeline
INSERT INTO public.pipelines (pipeline_id, name, location, leak_threshold, status)
VALUES ('PIPE-001', 'Main Demo Pipeline', 'Engineering Lab, Block A', 1.0, 'NORMAL');

-- Insert Device
INSERT INTO public.devices (device_id, name, status, last_seen, firmware_version)
VALUES ('ESP32-001', 'Pipeline Monitoring Unit', 'ONLINE', NOW(), 'v1.0.0');

-- Insert Settings
INSERT INTO public.settings (pipeline_name, leak_threshold, refresh_interval, notifications_enabled, theme)
VALUES ('Main Demo Pipeline', 1.0, 5, true, 'dark');

-- Insert Historical Sensor Readings
INSERT INTO public.sensor_readings (device_id, pipeline_id, flow_in, flow_out, difference, status, timestamp)
VALUES
  ('ESP32-001', 'PIPE-001', 8.5, 8.2, 0.3, 'NORMAL', NOW() - INTERVAL '30 minutes'),
  ('ESP32-001', 'PIPE-001', 8.4, 8.1, 0.3, 'NORMAL', NOW() - INTERVAL '25 minutes'),
  ('ESP32-001', 'PIPE-001', 8.6, 8.3, 0.3, 'NORMAL', NOW() - INTERVAL '20 minutes'),
  ('ESP32-001', 'PIPE-001', 8.5, 5.5, 3.0, 'LEAK',   NOW() - INTERVAL '15 minutes'),
  ('ESP32-001', 'PIPE-001', 8.7, 5.4, 3.3, 'LEAK',   NOW() - INTERVAL '10 minutes'),
  ('ESP32-001', 'PIPE-001', 8.3, 8.0, 0.3, 'NORMAL', NOW() - INTERVAL '5 minutes'),
  ('ESP32-001', 'PIPE-001', 8.5, 8.2, 0.3, 'NORMAL', NOW());

-- Insert Historical Leak Events
INSERT INTO public.leak_events (event_id, device_id, pipeline_id, start_time, end_time, flow_in, flow_out, difference, estimated_loss, status)
VALUES
  ('EVT-001', 'ESP32-001', 'PIPE-001', NOW() - INTERVAL '120 minutes', NOW() - INTERVAL '105 minutes', 8.5, 5.8, 2.7, 40.5, 'RESOLVED'),
  ('EVT-002', 'ESP32-001', 'PIPE-001', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '5 minutes', 8.6, 5.4, 3.2, 32.0, 'RESOLVED');
