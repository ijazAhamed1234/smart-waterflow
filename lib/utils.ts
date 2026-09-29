import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFlow(value: number): string {
  return value.toFixed(1);
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "NORMAL":
    case "RESOLVED":
      return "text-green-400";
    case "LEAK":
    case "ACTIVE":
      return "text-red-400";
    case "WARNING":
      return "text-amber-400";
    default:
      return "text-slate-400";
  }
}

export function getStatusBg(status: string) {
  switch (status) {
    case "NORMAL":
    case "RESOLVED":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "LEAK":
    case "ACTIVE":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "WARNING":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

export function getSignalStrength(dbm: number): string {
  if (dbm >= -50) return "Excellent";
  if (dbm >= -60) return "Strong";
  if (dbm >= -70) return "Good";
  if (dbm >= -80) return "Fair";
  return "Weak";
}

export function getSignalBars(dbm: number): number {
  if (dbm >= -50) return 5;
  if (dbm >= -60) return 4;
  if (dbm >= -70) return 3;
  if (dbm >= -80) return 2;
  return 1;
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
}
