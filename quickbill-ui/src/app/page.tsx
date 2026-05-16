// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, Command, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "@/lib/api";

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@quickbill.com", password: "admin123" }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.detail || "Login failed");
      
      // Save to Zustand and LocalStorage
      setAuth(result.access_token, result.email);
      router.push("/dashboard"); // We will build this next!
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-950 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Left Pane - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative z-10 border-r border-white/5 bg-zinc-950/50 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
            <Command className="w-8 h-8 text-indigo-500" />
            QuickBill
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 tracking-tighter">
            The intelligent <br /> POS for modern <br /> retail.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Manage inventory securely, checkout customers instantly, and get AI-driven insights to grow your store.
          </p>
        </motion.div>

        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Powered by FastAPI, MongoDB & Groq AI
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
              <p className="text-zinc-400 text-sm">Enter your credentials to access the terminal.</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input 
                  {...register("email")}
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="admin@quickbill.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Password</label>
                </div>
                <div className="relative">
                  <input 
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-indigo-500/20" />
                  <span className="text-sm text-zinc-400">Remember me</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-6 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Sign in to Terminal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}