import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, ShieldCheck, Lock, Mail, User, Phone, Eye, EyeOff, 
  ArrowRight, CheckCircle2, AlertCircle, Truck, Leaf, Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NUVA_LOGO_BASE64 } from '../../assets/logoBase64';

const AuthModal = () => {
  const { 
    user, 
    login, 
    register, 
    isAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    openAuthModal, 
    closeAuthModal 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-prompt popup on page load after short delay
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (isIframe) return; // Do not auto-show if inside Admin WebsiteEditor iframe

    const timer = setTimeout(() => {
      // Auto open login prompt on page load if user is not yet logged in
      if (!user) {
        openAuthModal('login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  // If modal is not open, return null
  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    closeAuthModal();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in your email and password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Welcome back! You are now logged in. Enjoy shopping.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setError(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully! You can now place orders.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  // 1-Click Demo autofill
  const fillDemo = (demoType) => {
    setError('');
    if (demoType === 'user') {
      setEmail('priya@example.com');
      setPassword('user123');
      setAuthModalMode('login');
    } else if (demoType === 'admin') {
      setEmail('admin@thenuva.com');
      setPassword('admin123');
      setAuthModalMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 font-sans my-auto transition-all"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 50px rgba(45, 71, 44, 0.25)'
        }}
      >
        {/* ========================================================================= */}
        {/* TOP BRAND BANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#1a3319] via-[#2d472c] to-[#1a3319] text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Ambient lighting */}
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/4 -bottom-8 w-28 h-28 bg-lime-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            title="Close popup"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 relative z-10">
            <img 
              src={NUVA_LOGO_BASE64} 
              alt="Nuva Nutrition" 
              className="h-10 sm:h-12 w-auto object-contain bg-white p-1 rounded-xl shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight font-display">
                  Welcome to The Nuva
                </h3>
                <span className="bg-emerald-400/25 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Pure & Fresh
                </span>
              </div>
              <p className="text-xs text-neutral-200 mt-0.5">
                Sign in to order chemical-free oils & track fresh deliveries
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB SWITCHER: SIGN IN / CREATE ACCOUNT */}
        {/* ========================================================================= */}
        <div className="flex border-b border-neutral-200 bg-neutral-50/80 p-1.5">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              authModalMode === 'login'
                ? 'bg-white text-[#2d472c] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Sign In to Order
          </button>
          <button
            onClick={() => {
              setAuthModalMode('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              authModalMode === 'register'
                ? 'bg-white text-[#2d472c] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Quick Demo Credentials Bar */}
          {authModalMode === 'login' && (
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  Quick 1-Click Demo Fill:
                </span>
                <span className="text-[10px] text-emerald-700 font-normal">Click to auto-test</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fillDemo('user')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100/50 transition-colors shadow-2xs"
                >
                  👤 Customer (Priya Sharma)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100/50 transition-colors shadow-2xs"
                >
                  🛡️ Super Admin
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fadeIn font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LOGIN FORM */}
          {/* ========================================================================= */}
          {authModalMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#2d472c] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700">Password</label>
                  <span className="text-[11px] text-neutral-400">min. 6 characters</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#2d472c] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2d472c] hover:bg-[#223821] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In & Order Products'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* ========================================================================= */
            /* REGISTER FORM */
            /* ========================================================================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#2d472c] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#2d472c] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Mobile Number (For Delivery Updates)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210 (Optional)"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#2d472c] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#2d472c] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2d472c] hover:bg-[#223821] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Start Shopping'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Guest Dismiss Button */}
          <div className="pt-2 text-center">
            <button
              onClick={handleClose}
              className="text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-4 transition-colors"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER TRUST BADGES */}
        {/* ========================================================================= */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-[11px] font-semibold text-neutral-600">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ozone-Cured Purity</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Doorstep Express</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit Secure</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
