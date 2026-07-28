import React from 'react';
import { GraduationCap, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs shadow-indigo-500/5 max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 transform hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-slate-900 leading-none">
                  Edu<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pay</span>
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 rounded-full border hidden sm:flex items-center gap-1.5 shadow-2xs ${
                  activeRole === 'admin' 
                    ? 'bg-slate-900 text-white border-slate-800' 
                    : 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeRole === 'admin' ? 'bg-emerald-400' : 'bg-indigo-600'} animate-pulse`} />
                  <span>{activeRole === 'admin' ? 'Admin Portal' : 'Student Portal'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-1 leading-none mt-1">
                <span>College Fee Management System</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Fast & Secure
                </span>
              </p>
            </div>
          </div>

          {/* User Account Controls & Logout Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-50/90 hover:bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs transition-all">
                <div className="text-right max-w-[70px] sm:max-w-[150px] truncate">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate">
                    {currentUser.fullName || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium font-mono leading-tight mt-0.5 truncate hidden sm:block">
                    +91 {currentUser.mobile || 'Active'}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-xs shrink-0">
                  {(currentUser.fullName?.[0] || 'S').toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout Account"
                  className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600 transition-colors shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

