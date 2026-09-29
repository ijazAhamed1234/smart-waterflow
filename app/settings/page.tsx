"use client";

import { useSimulation } from "@/contexts/SimulationContext";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { getSettings, updateSettings, updatePipeline } from "@/lib/api";
import { useState, useEffect } from "react";
import { Save, RotateCcw, Database, Check, Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-glass p-5">
      <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 pb-3 border-b border-[var(--border)]">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row py-1">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
        {description && <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      type="button"
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer",
        value ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          value ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { leakThreshold, setLeakThreshold, refreshInterval, setRefreshInterval, refreshDashboard } = useSimulation();
  const { theme, setTheme } = useTheme();
  const [notifLeak, setNotifLeak] = useState(true);
  const [notifDisconnect, setNotifDisconnect] = useState(true);
  const [notifWarning, setNotifWarning] = useState(true);
  const [pipelineName, setPipelineName] = useState("Main Demo Pipeline");
  const [deviceId, setDeviceId] = useState("ESP32-001");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load settings from Supabase API on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await getSettings();
        if (s) {
          if (s.pipeline_name) setPipelineName(s.pipeline_name);
          if (typeof s.leak_threshold === "number") setLeakThreshold(s.leak_threshold);
          if (typeof s.refresh_interval === "number") setRefreshInterval(s.refresh_interval * 1000);
          if (s.notifications_enabled !== undefined) setNotifLeak(s.notifications_enabled);
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadSettings();
  }, [setLeakThreshold, setRefreshInterval]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings({
        pipeline_name: pipelineName,
        leak_threshold: leakThreshold,
        refresh_interval: Math.max(1, Math.floor(refreshInterval / 1000)),
        notifications_enabled: notifLeak,
      });

      await updatePipeline("PIPE-001", {
        name: pipelineName,
        leak_threshold: leakThreshold,
      });

      await refreshDashboard();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to update settings in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setPipelineName("Main Demo Pipeline");
    setDeviceId("ESP32-001");
    setLeakThreshold(1.0);
    setRefreshInterval(5000);
    setNotifLeak(true);
    setNotifDisconnect(true);
    setNotifWarning(true);
    setTheme("system");

    try {
      await updateSettings({
        pipeline_name: "Main Demo Pipeline",
        leak_threshold: 1.0,
        refresh_interval: 5,
        notifications_enabled: true,
      });
      await refreshDashboard();
    } catch {}
  };

  const intervalSeconds = Math.max(1, Math.floor(refreshInterval / 1000));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">System Settings</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Configure Supabase persisted parameters and monitoring preferences</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all text-white cursor-pointer",
              saved
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {loading ? "Saving..." : saved ? "Saved to Supabase!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <SettingSection title="Appearance & Theme">
        <SettingRow label="Theme Preference" description="Select workspace color theme (persisted in browser storage)">
          <div className="flex items-center p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            {[
              { mode: "light", label: "Light", icon: Sun },
              { mode: "dark", label: "Dark", icon: Moon },
              { mode: "system", label: "System", icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setTheme(item.mode as ThemeMode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </SettingRow>
      </SettingSection>

      {/* Leak Detection */}
      <SettingSection title="Leak Detection Threshold">
        <SettingRow
          label="Leak Sensitivity Threshold"
          description={`Flow difference above this value triggers a leak state and Supabase record log. Current: ${leakThreshold.toFixed(1)} L/min`}
        >
          <div className="flex items-center gap-3 w-60">
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={leakThreshold}
              onChange={(e) => setLeakThreshold(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 w-20 text-center">
              {leakThreshold.toFixed(1)} L/min
            </span>
          </div>
        </SettingRow>
      </SettingSection>

      {/* Data Settings */}
      <SettingSection title="Telemetry Polling & Refresh">
        <SettingRow
          label="API Data Refresh Rate"
          description={`Frequency at which the frontend polls Next.js API endpoints for sensor telemetry. Current: every ${intervalSeconds}s`}
        >
          <div className="flex items-center gap-3 w-60">
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={intervalSeconds}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 w-20 text-center">
              {intervalSeconds}s
            </span>
          </div>
        </SettingRow>
      </SettingSection>

      {/* Device Configuration */}
      <SettingSection title="Device & Pipeline Metadata">
        <SettingRow label="Pipeline Name" description="Primary identifier stored in Supabase pipelines table">
          <input
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:bg-[var(--card)] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-52 font-medium"
            placeholder="Main Demo Pipeline"
          />
        </SettingRow>
        <SettingRow label="ESP32 Device ID" description="Hardware client identifier">
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:bg-[var(--card)] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-52 font-mono font-medium"
            placeholder="ESP32-001"
          />
        </SettingRow>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notification Preferences">
        <SettingRow label="Leak Detected Alerts" description="Toast notification when flow difference exceeds configured threshold">
          <Toggle value={notifLeak} onChange={setNotifLeak} />
        </SettingRow>
        <SettingRow label="Device Disconnect Alerts" description="Notify when hardware telemetry passes stale timeout threshold">
          <Toggle value={notifDisconnect} onChange={setNotifDisconnect} />
        </SettingRow>
        <SettingRow label="Warning State Alerts" description="Notify when minor delta is detected prior to full leak threshold">
          <Toggle value={notifWarning} onChange={setNotifWarning} />
        </SettingRow>
      </SettingSection>

      {/* Backend info */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
        <Database size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[var(--foreground)] mb-0.5">Supabase PostgreSQL Connected</p>
          <p className="text-xs text-[var(--muted)]">
            All system preferences and threshold rules persist directly to the PostgreSQL database table <code className="text-blue-600 dark:text-blue-400 font-mono font-semibold bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">settings</code> via Next.js REST API routes.
          </p>
        </div>
      </div>
    </div>
  );
}
