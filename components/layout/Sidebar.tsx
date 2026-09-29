"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  GitBranch,
  BarChart3,
  AlertTriangle,
  LineChart,
  Cpu,
  Settings,
  Droplets,
  X,
  Menu,
  ChevronRight,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/monitoring", label: "Live Monitoring", icon: Activity },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/sensors", label: "Sensor Data", icon: BarChart3 },
  { href: "/leaks", label: "Leak Events", icon: AlertTriangle },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "nav-item group relative",
        active && "active"
      )}
      onClick={onClick}
    >
      <Icon size={18} className={active ? "text-white" : "text-[#94A3B8] group-hover:text-white transition-colors"} />
      <span className="flex-1 font-medium">{label}</span>
      {active && <ChevronRight size={14} className="text-white opacity-80" />}
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { currentReading, deviceInfo, dbStatus } = useSimulation();
  const isOnline = deviceInfo.status === "ONLINE";
  const isDbConnected = dbStatus === "CONNECTED";

  return (
    <div className="flex flex-col h-full bg-[#081B38] text-slate-100 border-r border-[#1E293B]">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-5 py-5 bg-[#051329] border-b border-[#1E293B]">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20 shrink-0">
          <Droplets size={19} className="text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight block leading-tight">SmartFlow</span>
          <p className="text-[9px] text-blue-400 font-bold tracking-widest uppercase mt-0.5">Smart Water Monitor</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-white p-1 rounded"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-slate-400/80">
          NAVIGATION
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname === item.href || (pathname === "/" && item.href === "/dashboard")}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Device Status Footer */}
      <div className="px-3.5 pb-4 border-t border-[#1E293B] pt-4 space-y-2 bg-[#051329]/60">
        {/* Device Status Card */}
        <Link
          href="/devices"
          onClick={onClose}
          className="block rounded-xl bg-gradient-to-br from-[#102A4A] to-[#0D2340] border border-[#1E3A60] p-3 hover:border-blue-500/60 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            <span>DEVICE STATUS</span>
            <span className="text-slate-400 group-hover:text-blue-400 transition-colors">Details →</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white font-mono">{currentReading.deviceId || "ESP32-001"}</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-500")} />
              <span className={cn("text-[11px] font-bold tracking-wide", isOnline ? "text-emerald-400" : "text-red-400")}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
        </Link>

        {/* Database Status Card */}
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center justify-between rounded-xl bg-gradient-to-br from-[#102A4A] to-[#0D2340] border border-[#1E3A60] p-2.5 hover:border-blue-500/60 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Database size={13} className="text-blue-400" />
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">DATABASE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", isDbConnected ? "bg-emerald-400" : "bg-red-500")} />
            <span className={cn("text-[10px] font-bold tracking-wide", isDbConnected ? "text-emerald-400" : "text-red-400")}>
              {isDbConnected ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-[#111E33] border border-[#D8E3F0] dark:border-[#263957] text-[var(--text-primary)] shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#081B38] border-r border-[#1E293B] transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 h-screen bg-[#081B38] border-r border-[#1E293B] sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
