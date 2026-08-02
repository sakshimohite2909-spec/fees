import { LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, isAdminAuthenticated, onOpenAuth, onLogout, onExitAdmin }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs shadow-indigo-500/5 w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 border border-slate-200 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Netaji Polytechnic College Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="min-w-0">
              <span className="font-black text-xs sm:text-lg tracking-tight text-slate-900 leading-tight block truncate">
                Netaji Polytechnic College
              </span>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
                Dhule, Maharashtra
              </p>
            </div>
          </div>

          {/* User Account Controls & Logout Button */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {activeRole === 'admin' && isAdminAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2 bg-indigo-50/90 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-right hidden xs:block">
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-none">
                    Admin
                  </p>
                </div>
                <button
                  onClick={onExitAdmin || onLogout}
                  title="Logout Admin Portal"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-[11px] border border-rose-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : currentUser ? (
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
            ) : null}
          </div>

        </div>
      </div>
    </header>
  );
}

