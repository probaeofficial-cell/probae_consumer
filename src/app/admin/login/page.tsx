"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Activity, ShieldCheck, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex w-full font-sans bg-[#111111] overflow-hidden">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-24 overflow-y-auto py-12">
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          <div className="flex items-center space-x-2 h-10 w-32 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/PB_Probae - Wordmark.png" 
              alt="Probae Logo" 
              className="object-contain w-full h-full"
            />
          </div>

          <div className="bg-[#222222] p-8 rounded-2xl shadow-2xl border border-[#333333]">
            <h2 className="text-3xl font-extrabold text-white font-headline">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to keep managing the Probae platform.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/20 text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-xl relative block w-full pl-11 pr-3 py-3.5 bg-[#1A1A1A] border border-[#333333] placeholder-gray-500 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <a href="#" className="text-xs font-medium text-primary hover:text-[#8a2be2] transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-xl relative block w-full pl-11 pr-3 py-3.5 bg-[#1A1A1A] border border-[#333333] placeholder-gray-500 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full py-4 text-base font-semibold shadow-lg shadow-primary/20"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Hero Banner */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#111111] via-[#2D0A4E] to-[#6A0FAD]">
        {/* Subtle abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FF751F] blur-[100px]" />
          <div className="absolute bottom-0 left-20 w-80 h-80 rounded-full bg-[#4CAF50] blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col px-12 xl:px-20 w-full h-full justify-center overflow-y-auto py-8">
          <div className="my-auto w-full">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit mb-4 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#FF751F] animate-pulse" />
              <span className="text-[10px] font-semibold text-white tracking-wider uppercase">System Online</span>
            </div>

          <h1 className="text-4xl xl:text-5xl font-headline font-bold text-white leading-tight">
            Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF751F] to-[#FFB74D]">nutrition business</span> effortlessly.
          </h1>
          <p className="mt-4 text-base text-gray-300 max-w-lg leading-relaxed">
            Everything you need to orchestrate raw materials, calculate bowl costs, and fulfill orders in one unified command center.
          </p>

          {/* Code/Preview Block */}
          <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex space-x-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <pre className="text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed">
              <span className="text-[#FF751F]">const</span> signatureBowl = <span className="text-gray-500">{"{"}</span><br/>
              {"  "}name: <span className="text-green-400">"Probae Signature"</span>,<br/>
              {"  "}calories: <span className="text-purple-400">450</span>,<br/>
              {"  "}macros: <span className="text-gray-500">{"{"}</span><br/>
              {"    "}protein: <span className="text-green-400">"35g"</span>,<br/>
              {"    "}carbs: <span className="text-green-400">"40g"</span>,<br/>
              {"    "}fats: <span className="text-green-400">"15g"</span><br/>
              {"  "}<span className="text-gray-500">{"}"}</span>,<br/>
              {"  "}status: <span className="text-green-400">"Optimized"</span><br/>
              <span className="text-gray-500">{"}"}</span>;
            </pre>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="flex items-center space-x-2 text-white mb-1">
                <Activity className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span className="text-lg font-bold">99.9%</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Uptime</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="flex items-center space-x-2 text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF751F]" />
                <span className="text-lg font-bold">Secure</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Access</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="flex items-center space-x-2 text-white mb-1">
                <Zap className="w-3.5 h-3.5 text-[#6A0FAD]" />
                <span className="text-lg font-bold">Sync</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Real-time</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
