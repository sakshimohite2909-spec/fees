import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, LogOut, Sparkles, CreditCard } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, onSwitchRole, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-purple-200/90 shadow-md shadow-purple-500/5">
      {/* 🌈 Top Accent Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-violet-600"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-700 via-pink-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 shrink-0 transform hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900">
                  Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">Pay</span>
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full border shadow-2xs hidden sm:inline-block ${
                  activeRole === 'admin' 
                    ? 'bg-pink-100/80 text-pink-800 border-pink-300' 
                    : 'bg-purple-100/80 text-purple-900 border-purple-300'
                }`}>
                  {activeRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold hidden md:block leading-none">College Fee Management & Razorpay Checkout</p>
            </div>
          </div>

          {/* Center Navigation Role Selector (Desktop) */}
          <div className="hidden md:flex items-center bg-purple-100/60 p-1.5 rounded-2xl border border-purple-200 shadow-inner gap-1">
            <button
              onClick={() => onSwitchRole('student')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-gradient-to-r from-purple-700 to-violet-700 text-white shadow-md shadow-purple-500/20 scale-102'
                  : 'text-slate-600 hover:text-purple-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student View</span>
            </button>

            <button
              onClick={() => onSwitchRole('admin')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-md shadow-pink-500/20 scale-102'
                  : 'text-slate-600 hover:text-pink-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin View</span>
            </button>
          </div>

          {/* User Account Controls & Logout Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-purple-50/70 pl-2.5 sm:pl-3 pr-1 sm:pr-1.5 py-1 rounded-xl border border-purple-200/80 shadow-2xs">
                <div className="text-right max-w-[75px] sm:max-w-[140px] truncate">
                  <p className="text-xs sm:text-sm font-black text-slate-900 leading-none truncate">
                    {currentUser.fullName || 'Student'}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0">
                  {(currentUser.fullName?.[0] || 'S').toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] sm:text-xs border border-rose-200 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile view role pills */}
      <div className="flex md:hidden border-t border-purple-100 p-1.5 bg-purple-50/50 justify-center gap-2">
        <button
          onClick={() => onSwitchRole('student')}
          className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
            activeRole === 'student' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-slate-700 border-purple-200'
          }`}
        >
          Student View
        </button>
        <button
          onClick={() => onSwitchRole('admin')}
          className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
            activeRole === 'admin' ? 'bg-pink-600 text-white border-pink-600 shadow-sm' : 'bg-white text-slate-700 border-pink-200'
          }`}
        >
          Admin View
        </button>
      </div>
    </header>
  );
}

