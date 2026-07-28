import React from 'react';
import { GraduationCap, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  Edu<span className="text-indigo-600">Pay</span>
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border hidden sm:inline-block ${
                  activeRole === 'admin' 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {activeRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block leading-none mt-0.5">College Fee Management System</p>
            </div>
          </div>

          {/* User Account Controls & Logout Button */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-50 px-2 sm:px-3 py-1 rounded-xl border border-slate-200">
                <div className="text-right max-w-[90px] sm:max-w-[140px] truncate">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-none truncate">
                    {currentUser.fullName || 'Student'}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-[11px] sm:text-xs shrink-0">
                  {(currentUser.fullName?.[0] || 'S').toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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

