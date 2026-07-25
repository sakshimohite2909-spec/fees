import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, LogOut, Sparkles, CreditCard } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, onSwitchRole, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-30 glass-panel-glow border-b border-purple-200/60 bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title with Royal Purple & Magenta Gradient */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-violet-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 animate-pulse-glow">
              <GraduationCap className="w-6 h-6 animate-float" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-slate-900">
                  Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">Pay</span>
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm ${
                  activeRole === 'admin' 
                    ? 'bg-pink-50 text-pink-700 border-pink-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {activeRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">College Fee Management & Razorpay Checkout</p>
            </div>
          </div>

          {/* Center Navigation Role Selector */}
          <div className="hidden md:flex items-center bg-purple-50/70 p-1.5 rounded-2xl border border-purple-100 shadow-inner">
            <button
              onClick={() => onSwitchRole('student')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                activeRole === 'student'
                  ? 'bg-white text-purple-700 shadow-md border border-purple-200 scale-105'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Student View</span>
            </button>

            <button
              onClick={() => onSwitchRole('admin')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                activeRole === 'admin'
                  ? 'bg-white text-pink-700 shadow-md border border-pink-200 scale-105'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span>Admin View</span>
            </button>
          </div>

          {/* User Account Controls */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-purple-50/50 pl-3.5 pr-2 py-1.5 rounded-2xl border border-purple-200/80 shadow-sm">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900">{currentUser.fullName || currentUser.email.split('@')[0]}</p>
                  <p className="text-[10px] text-purple-600 font-semibold">{currentUser.email}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-purple-500/20">
                  {(currentUser.fullName?.[0] || currentUser.email[0]).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-purple-50 rounded-xl transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 rounded-2xl shadow-md shadow-purple-600/25 transition-all shimmer-btn"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register / Gmail Login</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile view role pills */}
      <div className="flex md:hidden border-t border-purple-100 p-2 bg-purple-50/50 justify-center gap-2">
        <button
          onClick={() => onSwitchRole('student')}
          className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
            activeRole === 'student' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-slate-700 border-purple-200'
          }`}
        >
          Student Dashboard
        </button>
        <button
          onClick={() => onSwitchRole('admin')}
          className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
            activeRole === 'admin' ? 'bg-pink-600 text-white border-pink-600 shadow-sm' : 'bg-white text-slate-700 border-pink-200'
          }`}
        >
          Admin Dashboard
        </button>
      </div>
    </header>
  );
}
