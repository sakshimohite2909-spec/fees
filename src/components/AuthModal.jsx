import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid Gmail ID / Email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isLogin && !fullName) {
      setError('Please enter your Full Name.');
      return;
    }

    const userData = {
      email,
      fullName: isLogin ? (fullName || email.split('@')[0]) : fullName,
      role
    };

    onAuthSuccess(userData);
    onClose();
  };

  const handleDemoLogin = (demoRole) => {
    const demoUser = demoRole === 'admin'
      ? { email: 'admin.college@gmail.com', fullName: 'College Principal Admin', role: 'admin' }
      : { email: 'sakshi.student@gmail.com', fullName: 'Sakshi Patil', role: 'student' };
    
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 max-w-md w-full overflow-hidden soft-shadow">
        
        {/* Header banner */}
        <div className="bg-gradient-to-r from-purple-800 via-violet-700 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isLogin ? 'Welcome Back!' : 'Create Gmail Account'}
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            {isLogin ? 'Sign in to access your Fee Dashboard' : 'Register with your Gmail ID & Password'}
          </p>
        </div>

        <div className="p-6">
          {/* Quick Demo Login Bar */}
          <div className="mb-5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">⚡ Quick Demo Login:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="px-2.5 py-1 text-xs font-bold bg-white text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg shadow-sm border border-purple-200 transition-all"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-2.5 py-1 text-xs font-bold bg-white text-pink-700 hover:bg-pink-600 hover:text-white rounded-lg shadow-sm border border-pink-200 transition-all"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'student'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm ring-2 ring-purple-600/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'admin'
                      ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-sm ring-2 ring-pink-600/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sakshi Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gmail ID / Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition-all"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account & Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-purple-600 hover:text-purple-700 font-bold hover:underline"
              >
                {isLogin ? 'Sign Up with Gmail' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
