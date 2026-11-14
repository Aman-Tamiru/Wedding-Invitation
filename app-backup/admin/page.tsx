'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, LogOut, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { FloralSpray, FloralDivider } from '@/components/FloralDecorations';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is an admin
        const { data: adminData } = await supabase
          .from('admin_staff')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminData) {
          router.push('/admin/dashboard');
          return;
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_staff')
        .select('id, role, full_name')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!adminData) {
        await supabase.auth.signOut();
        setError('You do not have admin access. Please contact the owner.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
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
            <h1 className="font-script text-4xl text-blush-deep">Admin Login</h1>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-ink-light mt-2">
              Betslot &amp; Amanuel Wedding
            </p>
            <FloralDivider className="mt-4" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-body text-sm text-ink mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@email.com"
                className="w-full rounded-lg border border-blush-deep/30 bg-ivory px-4 py-2.5 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blush-deep/30"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-ink mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-blush-deep/30 bg-ivory px-4 py-2.5 pr-10 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blush-deep/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-blush-deep"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                'Sign In'
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
