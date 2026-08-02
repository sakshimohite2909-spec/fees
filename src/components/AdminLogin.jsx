import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle, Sparkles, LogOut } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToStudentPortal }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials (accept 'admin' / 'admin@college.edu' and 'admin123')
      const cleanUser = username.trim().toLowerCase();
      if ((cleanUser === 'admin' || cleanUser === 'admin@college.edu' || cleanUser === 'principal') && password === 'admin123') {
        setIsLoading(false);
        onLoginSuccess({
          username: cleanUser,
          fullName: 'Principal / Admin Office',
          role: 'admin'
        });
      } else {
        setIsLoading(false);
        setError('Invalid Admin Username or Password. (Default Password: admin123)');
      }
    }, 400);
  };

  const handleQuickAdminLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    onLoginSuccess({
      username: 'admin',
      fullName: 'Principal / Admin Office',
      role: 'admin'
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
        
        {/* Top Decorative Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

        {/* Header Branding */}
        <div className="text-center space-y-3 mb-6 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-md shadow-indigo-600/10">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Admin Portal Login
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Netaji Polytechnic College • Administrative Access
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-slide-up">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Username / Email</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
              className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 shadow-2xs"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Default Password: <code className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">admin123</code></p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Login to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>

        </form>

        {/* Quick Demo 1-Click Login Helper */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 font-extrabold text-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>1-Click Quick Admin Login</span>
          </button>

          <button
            type="button"
            onClick={onBackToStudentPortal}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return to Student Fee Portal</span>
          </button>
        </div>

      </div>
    </div>
  );
}
