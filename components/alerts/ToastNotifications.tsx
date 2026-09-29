"use client";

import { useSimulation, type ToastMessage } from "@/contexts/SimulationContext";
import { X, AlertTriangle, CheckCircle, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

function Toast({ msg, onDismiss }: { msg: ToastMessage; onDismiss: () => void }) {
  const icons = {
    LEAK: <AlertTriangle size={16} className="text-red-400" />,
    RESOLVED: <CheckCircle size={16} className="text-green-400" />,
    DISCONNECT: <WifiOff size={16} className="text-amber-400" />,
    RECONNECT: <CheckCircle size={16} className="text-blue-400" />,
    WARNING: <AlertTriangle size={16} className="text-amber-400" />,
  };

  const borders = {
    LEAK: "border-red-500/40 bg-red-950/60",
    RESOLVED: "border-green-500/40 bg-green-950/60",
    DISCONNECT: "border-amber-500/40 bg-amber-950/60",
    RECONNECT: "border-blue-500/40 bg-blue-950/60",
    WARNING: "border-amber-500/40 bg-amber-950/60",
  };

  return (
    <div
      className={cn(
        "w-72 rounded-xl border backdrop-blur-xl p-4 shadow-2xl animate-slide-up",
        borders[msg.type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[msg.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{msg.title}</p>
          <p className="text-xs text-slate-300 mt-0.5">{msg.message}</p>
          {msg.details && (
            <div className="mt-2 space-y-0.5">
              {Object.entries(msg.details).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function ToastNotifications() {
  const { toastMessages, dismissToast } = useSimulation();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toastMessages.map((msg) => (
        <div key={msg.id} className="pointer-events-auto">
          <Toast msg={msg} onDismiss={() => dismissToast(msg.id)} />
        </div>
      ))}
    </div>
  );
}
