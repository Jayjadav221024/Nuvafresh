import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@thenuva.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-secondary-50">
      <div className="max-w-md w-full bg-white rounded-lg p-8 border border-secondary-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-lg bg-primary-100 border border-primary-300 flex items-center justify-center text-primary-700 mx-auto">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-950 font-display">Welcome to The Nuva</h2>
          <p className="text-xs text-secondary-600">Sign in to manage orders, batches or your farm basket</p>
        </div>

        {/* Quick Admin Credential Helper Banner */}
        <div className="p-3.5 rounded-lg bg-primary-50 border border-primary-200 text-xs text-neutral-800 space-y-1">
          <div className="font-bold text-primary-800 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-primary-600" /> Quick Demo Credentials:
          </div>
          <p className="text-xs text-secondary-800 font-medium">
            Admin: <span className="font-mono text-primary-800 font-bold">admin@thenuva.com</span> / <span className="font-mono text-primary-800 font-bold">admin123</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="text-xs font-bold text-neutral-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-white border border-secondary-300 rounded-lg px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-white border border-secondary-300 rounded-lg px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          New to chemical-free eating?{' '}
          <Link to="/register" className="text-primary-700 hover:underline font-bold">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
