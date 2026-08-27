import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { ShieldCheck, Lock, ArrowRight, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('admin@thenuva.com');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // If user is already authenticated with proper role, render children
  if (user && (!adminOnly || user.role === 'admin')) {
    return children;
  }

  const handleAdminQuickLogin = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dedicated High-Security Admin Portal Access Gate
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-[#122312] to-neutral-950 flex items-center justify-center p-4 sm:p-6 font-sans text-white relative overflow-hidden">
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Top Branding Card */}
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              Nuva Admin Portal
            </h2>
            <p className="text-xs text-neutral-400">
              Super Admin authorization required to manage products, live tracking & CMS.
            </p>
          </div>

          {/* Quick 1-Click Auto Fill Banner */}
          <div 
            onClick={() => { setEmail('admin@thenuva.com'); setPassword('admin123'); }}
            className="cursor-pointer p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 flex items-center justify-between gap-3 transition-colors shadow-inner"
          >
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300 block">1-Click Admin Access</span>
                <span className="text-[10px] text-neutral-400 font-mono">admin@thenuva.com • admin123</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase">
              Auto-Fill
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminQuickLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none text-sm text-white font-mono"
                placeholder="admin@thenuva.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none text-sm text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authorizing Portal Access...</span>
              ) : (
                <>
                  <span>Enter Nuva Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront Homepage</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProtectedRoute;
