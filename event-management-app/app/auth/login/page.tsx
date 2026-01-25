"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FCD34D] via-[#FDE68A] to-[#FCD34D] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FCD34D] to-[#FDE68A] shadow-lg">
            <Calendar className="text-[#1F2937]" size={32} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold text-[#1F2937]">Event Management</h1>
          <p className="mt-2 text-[#1F2937]/90">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6 rounded-2xl bg-[#FFFFFF] p-8 shadow-xl border border-[#E5E7EB]"
        >
          {error && (
            <div className="rounded-[16px] bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[#1F2937] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                size={18}
                strokeWidth={2}
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-[#1F2937] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                size={18}
                strokeWidth={2}
              />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[20px] bg-[#FCD34D] h-11 px-4 text-base font-medium text-[#1F2937] shadow-sm transition-all duration-200 hover:bg-[#FDE68A] focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
