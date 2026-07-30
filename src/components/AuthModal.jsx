import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Lock, RefreshCw, GraduationCap, Shield, User, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [instituteType, setInstituteType] = useState('College');
  const [loginMode, setLoginMode] = useState('mobile'); // 'mobile' | 'email' | 'userid'
  const [fullNameInput, setFullNameInput] = useState('');
  const [credentialInput, setCredentialInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  // Generate random captcha string (e.g. rLyk0p)
  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewCaptcha();
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!credentialInput.trim()) {
      setError(`Please enter your ${loginMode === 'mobile' ? 'Mobile Number' : loginMode === 'email' ? 'Email Address' : 'User ID'}.`);
      return;
    }

    if (captchaInput.trim() !== generatedCaptcha) {
      setError('Invalid Captcha Code. Please enter the exact code shown above.');
      generateNewCaptcha();
      return;
    }

    // Process authentication
    const userEmail = loginMode === 'email' 
      ? credentialInput.trim() 
      : `${credentialInput.trim().toLowerCase()}@gmail.com`;

    const userFullName = fullNameInput.trim() || (loginMode === 'mobile'
      ? `Student (${credentialInput.trim()})`
      : credentialInput.trim().split('@')[0]);

    onAuthSuccess({
      email: userEmail,
      fullName: userFullName,
      mobile: loginMode === 'mobile' ? credentialInput.trim() : '',
      instituteType,
      role
    });

    onClose();
  };

  const handleDemoLogin = (demoRole) => {
    const demoUser = demoRole === 'admin'
      ? { email: 'admin.college@gmail.com', fullName: 'College Admin Principal', role: 'admin', mobile: '9876543210' }
      : { email: 'sakshi.patil@gmail.com', fullName: 'Sakshi Patil', role: 'student', mobile: '9876543210' };
    
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      
      {/* Light Theme Main Container */}
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-purple-100 max-w-4xl w-full overflow-hidden soft-shadow my-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-4 z-20 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Light Theme Logo Header */}
        <div className="bg-gradient-to-r from-slate-50 via-purple-50/40 to-slate-50 px-6 py-3 flex items-center justify-between border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
              N
            </div>
            <div>
              <span className="text-lg font-black text-blue-950 tracking-tight">
                Netaji Polytechnic College
              </span>
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest -mt-0.5">
                Student Fee Portal • Dhule
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black bg-blue-50 text-blue-800 px-3.5 py-1 rounded-full border border-blue-200 hidden sm:inline-block">
              Online Fee Portal
            </span>
          </div>
        </div>

        {/* Split Grid: Left Light Hero Banner + Right Light Login Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          
          {/* LEFT COLUMN: Light Theme Hero Section */}
          <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-purple-50/70 via-pink-50/40 to-blue-50/60 border-r border-purple-100">
            
            {/* Background Glow Circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10 my-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
                Start Using <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600">
                  EduPay Now!
                </span>
              </h1>

              <div className="space-y-3.5 pt-2 text-slate-700 text-sm font-semibold">
                <div className="flex items-start gap-2.5">
                  <span className="text-purple-600 font-black text-base">●</span>
                  <p>Best online fee collection platform for educational campuses.</p>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="text-pink-500 font-black text-base">●</span>
                  <p>Instant Razorpay gateway integration for tuition & exam fees.</p>
                </div>
              </div>

              {/* Quick Demo Login Switcher */}
              <div className="pt-5 space-y-2.5 border-t border-purple-200/60">
                <p className="text-[11px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> <span>Quick Demo Login Buttons</span>
                </p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('student')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-black shadow-md shadow-purple-600/20 transition-all text-center"
                  >
                    Student Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-pink-600 text-white hover:bg-pink-700 text-xs font-black shadow-md shadow-pink-600/20 transition-all text-center"
                  >
                    Admin Login
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 text-xs text-slate-500 font-bold border-t border-purple-200/60 flex justify-between">
              <a href="#terms" className="hover:underline text-purple-700">Terms of Use</a>
              <span>Privacy Policy</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Light Theme Login Form */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-white flex flex-col justify-center">
            
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Institute Type Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800">Institute Type</label>
                <select
                  value={instituteType}
                  onChange={(e) => setInstituteType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-slate-50/50 text-slate-900 font-extrabold text-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="College">College</option>
                </select>
              </div>

              {/* Login Mode Radio Buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-5 text-xs font-black text-slate-800 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMode"
                      checked={loginMode === 'mobile'}
                      onChange={() => setLoginMode('mobile')}
                      className="w-4 h-4 text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <span>Mobile</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMode"
                      checked={loginMode === 'email'}
                      onChange={() => setLoginMode('email')}
                      className="w-4 h-4 text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <span>Email</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMode"
                      checked={loginMode === 'userid'}
                      onChange={() => setLoginMode('userid')}
                      className="w-4 h-4 text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <span>UserID/Password</span>
                  </label>
                </div>
              </div>

              {/* Student Full Name Text Box */}
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Enter Student Name"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-extrabold text-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 focus:outline-none placeholder-slate-400 shadow-sm transition-all"
                />
              </div>

              {/* Dynamic Mobile / Credential Text Box */}
              <div className="space-y-1.5">
                <input
                  type={loginMode === 'mobile' ? 'tel' : loginMode === 'email' ? 'email' : 'text'}
                  required
                  placeholder={
                    loginMode === 'mobile'
                      ? 'Enter registered mobile number'
                      : loginMode === 'email'
                      ? 'Enter registered email address'
                      : 'Enter UserID / Roll Number'
                  }
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-extrabold text-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 focus:outline-none placeholder-slate-400 shadow-sm transition-all"
                />
              </div>

              {loginMode === 'userid' && (
                <div className="space-y-1.5">
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-semibold text-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 focus:outline-none placeholder-slate-400 shadow-sm"
                  />
                </div>
              )}

              {/* Captcha Code Box */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  {/* Dynamic Captcha Visual Box (Light Theme) */}
                  <div className="px-5 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-950 font-mono text-xl font-black tracking-widest rounded-xl border-2 border-purple-300 shadow-inner select-none relative overflow-hidden flex items-center justify-center min-w-[130px]" style={{ fontStyle: 'italic', letterSpacing: '4px' }}>
                    <span className="line-through decoration-purple-400 decoration-2">{generatedCaptcha}</span>
                  </div>

                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    title="Refresh Captcha Code"
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors border border-purple-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Enter captcha code"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-semibold text-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 focus:outline-none placeholder-slate-400 shadow-sm"
                />
              </div>

              {/* Submit Button (Feepayr Style Lime Green / Gradient Button) */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-lime-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Send OTP / Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
