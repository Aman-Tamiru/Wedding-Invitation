
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { FloralSpray, FloralDivider } from "@/components/FloralDecorations";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!active) return;

        if (response.ok) {
          router.replace("/admin/dashboard");
          return;
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }

      if (active) {
        setCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Invalid credentials. Please try again."
        );
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Loader2 className="w-8 h-8 text-blush-deep animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 watercolor-texture" />

      <FloralSpray className="absolute top-8 left-4 w-28 h-28 opacity-50" />
      <FloralSpray className="absolute top-8 right-4 w-28 h-28 opacity-50" flip />
      <FloralSpray className="absolute bottom-8 left-4 w-28 h-28 opacity-50" />
      <FloralSpray className="absolute bottom-8 right-4 w-28 h-28 opacity-50" flip />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        <div className="bg-gradient-to-br from-ivory to-blush-light/40 rounded-3xl p-8 md:p-10 border border-gold/30 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blush-light border border-blush-deep/30 mb-4">
              <Lock className="w-8 h-8 text-blush-deep" />
            </div>

            <h1 className="font-script text-4xl text-blush-deep">
              Admin Login
            </h1>

            <p className="font-body text-xs tracking-[0.3em] uppercase text-ink-light mt-2">
              Betslot &amp; Amanuel Wedding
            </p>

            <FloralDivider className="mt-4" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-body text-sm text-ink mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@email.com"
                autoComplete="username"
                className="w-full rounded-lg border border-blush-deep/30 bg-ivory px-4 py-2.5 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blush-deep/30"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-ink mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-blush-deep/30 bg-ivory px-4 py-2.5 pr-10 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blush-deep/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-blush-deep"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-blush-deep to-blush-deep/85 text-ivory font-body text-sm tracking-[0.2em] uppercase shadow-lg disabled:opacity-60 hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="font-body text-xs text-ink-light hover:text-blush-deep transition-colors"
            >
              ← Back to invitation
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
