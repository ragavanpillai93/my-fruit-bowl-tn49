import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Store,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { loginAdmin, registerAdmin, resetAdminPassword } from '../../services/authService';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onBackToStore,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An admin account with this email already exists. Please Sign In.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Access temporarily blocked due to multiple failed login attempts. Please reset your password or try again later.';
    }
    if (message.includes('Access Denied')) {
      return message;
    }
    return message || 'Authentication failed. Please check your connection and credentials.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your Admin Email and Password');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await loginAdmin(email, password);
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter an Admin Email and Password (min 6 chars)');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await registerAdmin(email, password, displayName.trim() || 'Kitchen Admin');
      setSuccessMessage('Admin account registered successfully! Redirecting to Dashboard...');
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your admin email address to receive password reset instructions.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetAdminPassword(email);
      setSuccessMessage(`Password reset link dispatched to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081E14] flex flex-col items-center justify-center p-4 sm:p-6 text-white selection:bg-[#7BF587] selection:text-[#0F2A1D]">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#0F2A1D] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto text-[#7BF587] shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Fruit Bowl TN 49
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7BF587]" />
            <span>Secure Admin Authentication</span>
          </div>

          <p className="text-xs text-emerald-100/70 pt-1">
            Authorized portal for kitchen order fulfillment, real-time live menu, and operations management in Thanjavur.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-black/30 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            id="tab-auth-login"
            onClick={() => {
              setAuthMode('login');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          
          <button
            type="button"
            id="tab-auth-register"
            onClick={() => {
              setAuthMode('register');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Staff</span>
          </button>
        </div>

        {/* Alert / Notification banners */}
        {error && (
          <div className="text-xs text-rose-200 bg-rose-500/20 p-3.5 rounded-2xl border border-rose-500/40 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="text-xs text-emerald-200 bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-500/40 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#7BF587] shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7BF587]" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                id="input-admin-email"
                placeholder="admin@example.com"
                value={email}
                required
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-emerald-500/30 rounded-2xl text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-[#7BF587] text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#7BF587]" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => {
                    setAuthMode('forgot');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-[11px] text-emerald-300 hover:text-white font-medium cursor-pointer transition-colors"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-admin-password"
                  placeholder="Enter your admin password"
                  value={password}
                  required
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 bg-black/30 border border-emerald-500/30 rounded-2xl text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-[#7BF587] text-sm transition-all"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-300/60 hover:text-white p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-admin-login-submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#7BF587] hover:bg-[#6ee07a] text-[#0F2A1D] font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 mt-2"
            >
              <span>{isLoading ? 'Authenticating with Firebase...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. REGISTER ADMIN FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                Admin Full Name / Role
              </label>
              <input
                type="text"
                id="input-register-name"
                placeholder="e.g. Kitchen Operations Manager"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-emerald-500/30 rounded-2xl text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-[#7BF587] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7BF587]" />
                <span>Admin Work Email</span>
              </label>
              <input
                type="email"
                id="input-register-email"
                placeholder="admin@example.com"
                value={email}
                required
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-emerald-500/30 rounded-2xl text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-[#7BF587] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#7BF587]" />
                <span>Password (minimum 6 characters)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-register-password"
                  placeholder="Create secure admin password"
                  value={password}
                  required
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 bg-black/30 border border-emerald-500/30 rounded-2xl text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-[#7BF587] text-sm"
                />
                <button
                  type="button"
                  id="btn-toggle-register-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-300/60 hover:text-white p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-admin-register-submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#7BF587] hover:bg-[#6ee07a] text-[#0F2A1D] font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 mt-2"
            >
              <span>{isLoading ? 'Creating Admin Record...' : 'Create Admin Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Enter your registered admin email address. Firebase will dispatch a secure password reset link to your inbox.
            </p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7BF587]" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                id="input-forgot-email"
                placeholder="admin@example.com"
                value={email}
                required
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-emerald-500/30 rounded-2xl text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-[#7BF587] text-sm"
              />
            </div>

            <button
              type="submit"
              id="btn-admin-forgot-submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#7BF587] hover:bg-[#6ee07a] text-[#0F2A1D] font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
            >
              <span>{isLoading ? 'Sending Reset Email...' : 'Send Password Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                id="btn-back-to-login"
                onClick={() => setAuthMode('login')}
                className="text-xs text-emerald-300 hover:text-white font-semibold cursor-pointer"
              >
                ← Back to Admin Sign In
              </button>
            </div>
          </form>
        )}

        {/* Footer info & Return to store link */}
        <div className="pt-2 border-t border-emerald-500/20 text-center">
          <button
            type="button"
            id="btn-back-to-public-store"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/70 hover:text-white transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Return to Customer Website</span>
          </button>
        </div>

      </div>

      <div className="mt-8 text-center text-xs text-emerald-100/40">
        My Fruit Bowl TN 49 • Firebase Cloud Authentication & Security Guarded
      </div>
    </div>
  );
};

