"use client";

import { usePathname } from "next/navigation";
import { Bell, User, Wifi, Server, Database, Sun, Moon } from "lucide-react";
import { useSimulation } from "@/contexts/SimulationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn, timeAgo } from "@/lib/utils";
import { useState, useEffect } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/monitoring": "Live Monitoring",
  "/pipeline": "Pipeline",
  "/sensors": "Sensor Data",
  "/leaks": "Leak Events",
  "/analytics": "Analytics",
  "/devices": "Devices",
  "/settings": "Settings",
};

export function TopHeader() {
  const pathname = usePathname();
  const { currentReading, deviceInfo, lastUpdated, toastMessages, dbStatus, apiStatus } = useSimulation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [timeAgoStr, setTimeAgoStr] = useState(() => timeAgo(lastUpdated));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgoStr(timeAgo(lastUpdated));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const title = pageTitles[pathname] ?? "Dashboard";
  const unreadCount = toastMessages.length;
  const isDbConnected = dbStatus === "CONNECTED";
  const isDeviceOnline = deviceInfo.status === "ONLINE";

  // Data freshness check (stale if > 15 seconds)
  const secondsSinceUpdate = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
  const isFresh = secondsSinceUpdate < 15;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 lg:px-8 h-16 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--header-border)] transition-colors">
      {/* Page title — offset on mobile for hamburger */}
      <div className="pl-10 lg:pl-0 flex-1 min-w-0">
        <h1 className="text-base font-bold text-[var(--text-primary)] truncate">{title}</h1>
      </div>

      {/* Status strip — clean, crisp compact status pills */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
        {/* REALTIME FRESHNESS */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#111E33] border border-[#D8E3F0] dark:border-[#263957] shadow-2xs">
          <span className={cn("w-2 h-2 rounded-full", isFresh ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
          <span className="text-blue-600 dark:text-blue-400 font-extrabold uppercase text-[10px] tracking-wider">
            {isFresh ? "LIVE" : "STALE"}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] font-normal">
            ({timeAgoStr})
          </span>
        </div>

        {/* API STATUS */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#111E33] border border-[#D8E3F0] dark:border-[#263957] shadow-2xs">
          <Server size={12} className="text-blue-600 dark:text-blue-400" />
          <span className="text-[var(--text-muted)] font-medium">API:</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">{apiStatus}</span>
        </div>

        {/* DATABASE STATUS */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#111E33] border border-[#D8E3F0] dark:border-[#263957] shadow-2xs">
          <Database size={12} className={isDbConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
          <span className="text-[var(--text-muted)] font-medium">DB:</span>
          <span className={cn("font-bold", isDbConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
            {dbStatus}
          </span>
        </div>

        {/* DEVICE STATUS */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#111E33] border border-[#D8E3F0] dark:border-[#263957] shadow-2xs">
          <Wifi size={12} className={isDeviceOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
          <span className="text-[var(--text-muted)] font-medium">{currentReading.deviceId || "ESP32-001"}:</span>
          <span className={cn("font-bold", isDeviceOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
            {isDeviceOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-2">
        {/* Theme Quick Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-inner)] border border-transparent hover:border-[var(--border-card)] transition-all"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-inner)] border border-transparent hover:border-[var(--border-card)] transition-all">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#111E33] border border-[#D8E3F0] dark:border-[#263957] text-[var(--text-primary)] hover:bg-[var(--bg-inner)] transition-all shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-xs">
            <User size={12} className="text-white" />
          </div>
          <span className="hidden md:block text-xs font-semibold">Admin</span>
        </button>
      </div>
    </header>
  );
}
