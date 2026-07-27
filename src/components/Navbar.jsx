import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, LogOut, Sparkles, CreditCard } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, onSwitchRole, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-30 glass-panel-glow border-b border-purple-200/60 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-15 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-pink-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                  Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">Pay</span>
                </span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full border shadow-xs ${
                  activeRole === 'admin' 
                    ? 'bg-pink-50 text-pink-700 border-pink-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {activeRole === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block leading-none">College Fee Management & Razorpay Checkout</p>
            </div>
          </div>

          {/* Center Navigation Role Selector (Desktop) */}
          <div className="hidden md:flex items-center bg-purple-50/70 p-1 rounded-xl border border-purple-100 shadow-inner">
            <button
              onClick={() => onSwitchRole('student')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300 cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Student View</span>
            </button>

            <button
              onClick={() => onSwitchRole('admin')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300 cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-white text-pink-700 shadow-sm border border-pink-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
              <span>Admin View</span>
            </button>
          </div>

          {/* User Account Controls & Logout Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-2 sm:gap-2.5 bg-purple-50/60 pl-3 pr-1.5 py-1 rounded-xl border border-purple-200/80 shadow-xs">
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    {currentUser.fullName || 'Student'}
                  </p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-white text-xs shadow-xs">
                  {(currentUser.fullName?.[0] || 'S').toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition-all cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
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

