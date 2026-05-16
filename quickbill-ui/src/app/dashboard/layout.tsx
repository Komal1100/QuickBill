// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { Command, LayoutDashboard, ShoppingCart, Package, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import AiInsightsPanel from "./components/AiInsightsPanel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Hydration fix & Auth check
  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  if (!mounted || !token) return null; // Prevent hydration flash

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "POS Terminal", icon: ShoppingCart, path: "/dashboard/pos" },
    { name: "Inventory", icon: Package, path: "/dashboard/inventory" },
    { name: "Reports", icon: FileText, path: "/dashboard/reports" },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-50">
      {/* Sidebar */}
      <nav className="w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl flex flex-col relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
            <Command className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">QuickBill</span>
        </div>

        

        <div className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActive ? "text-white bg-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/10" 
                      initial={false} 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="font-medium relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>


        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[url('/noise.png')] relative">
        <div className="absolute inset-0 bg-zinc-950/80 -z-10" /> {/* Noise overlay if you have a noise.png, otherwise just dark */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}