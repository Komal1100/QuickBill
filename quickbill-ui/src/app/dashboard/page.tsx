// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, TrendingUp, DollarSign, Package, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

// Dummy Data for the Chart
const salesData = [
  { name: "Mon", total: 1200 }, { name: "Tue", total: 2100 }, { name: "Wed", total: 1800 },
  { name: "Thu", total: 2400 }, { name: "Fri", total: 3400 }, { name: "Sat", total: 4200 },
  { name: "Sun", total: 3100 },
];

export default function DashboardPage() {
  const { token } = useAuthStore();
  const [aiSummary, setAiSummary] = useState("Analyzing today's business data...");

  useEffect(() => {
    // Fetch AI Summary from our FastAPI backend
    const fetchInsights = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/insights/summary", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.summary) setAiSummary(data.summary);
      } catch (error) {
        setAiSummary("Unable to connect to AI engine at the moment.");
      }
    };
    fetchInsights();
  }, [token]);

  const MetricCard = ({ title, value, icon: Icon, trend, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <span className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" /> {trend}
        </span>
      </div>
      <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-400 mt-1">Here is what's happening in your store today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Today's Revenue" value="$4,250.00" icon={DollarSign} trend="+12.5%" delay={0.1} />
        <MetricCard title="Active Orders" value="142" icon={CreditCard} trend="+8.2%" delay={0.2} />
        <MetricCard title="Low Stock Items" value="4" icon={Package} trend="-2.4%" delay={0.3} />
        <MetricCard title="Avg. Order Value" value="$85.20" icon={TrendingUp} trend="+4.1%" delay={0.4} />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart (Takes up 2 columns) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Overview (7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights Card (Takes 1 column) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-b from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 flex flex-col"
        >
          {/* Animated glowing orb in background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="bg-indigo-500 p-2 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Business Summary</h3>
          </div>
          
          <div className="flex-1 flex items-center relative z-10">
            <p className="text-zinc-300 text-base leading-relaxed">
              "{aiSummary}"
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
            <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors">
              Generate Detailed Report &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}