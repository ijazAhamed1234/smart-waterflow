import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimulationProvider } from "@/contexts/SimulationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { ToastNotifications } from "@/components/alerts/ToastNotifications";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SmartFlow – Water Pipeline Monitoring",
  description:
    "Real-time smart water pipeline monitoring and leak detection system powered by ESP32 and IoT sensors.",
  keywords: ["water", "pipeline", "IoT", "leak detection", "ESP32", "monitoring"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('smartflow_theme') || 'system';
    var isDark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SimulationProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopHeader />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                  <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <ToastNotifications />
          </SimulationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

