import React, { useState, useEffect } from 'react';
import { 
  CreditCard, UserPlus, CheckCircle, Clock, FileText, 
  Sparkles, Award, ArrowRight, ShieldCheck, Download, Edit3, Save, Check,
  Zap, Lock, FileCheck, HelpCircle, ArrowUpRight, TrendingUp, Layers
} from 'lucide-react';

export default function StudentDashboard({ 
  currentUser, 
  feesConfig, 
  students, 
  payments, 
  onSaveStudent, 
  onInitiatePayment,
  onViewInvoice,
  onOpenAuth 
}) {
  // Find current student profile or build draft
  const studentProfile = students.find(s => s.email === currentUser?.email) || {
    email: currentUser?.email || '',
    fullName: currentUser?.fullName || '',
    rollNo: '',
    prnNo: '',
    educationDetails: {
      course: 'B.Tech Computer Science',
      branch: 'Computer Engineering',
      year: '3rd Year',
      semester: '5th Semester',
      mobile: '',
      collegeName: 'Government Engineering College'
    }
  };

  const [formData, setFormData] = useState(studentProfile);
  const [isEditingForm, setIsEditingForm] = useState(!studentProfile.rollNo);
  const [formSubmitted, setFormSubmitted] = useState(!!studentProfile.rollNo);

  useEffect(() => {
    if (studentProfile) {
      setFormData(studentProfile);
      setFormSubmitted(!!studentProfile.rollNo);
    }
  }, [currentUser]);

  // Payment Status checks
  const myPayments = payments.filter(p => p.studentId === studentProfile.id || p.rollNo === formData.rollNo);
  const isTuitionPaid = myPayments.some(p => p.feeType === 'tuitionFee' && p.status === 'PAID');
  const isCollegePaid = myPayments.some(p => p.feeType === 'collegeFee' && p.status === 'PAID');

  const tuitionPaymentRecord = myPayments.find(p => p.feeType === 'tuitionFee' && p.status === 'PAID');
  const collegePaymentRecord = myPayments.find(p => p.feeType === 'collegeFee' && p.status === 'PAID');

  const totalPaidAmount = myPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalFeesDue = (feesConfig.tuitionFee || 0) + (feesConfig.collegeFee || 0);
  const remainingDues = Math.max(0, totalFeesDue - totalPaidAmount);
  const completionPercentage = Math.round((totalPaidAmount / totalFeesDue) * 100);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSaveStudent(formData);
    setFormSubmitted(true);
    setIsEditingForm(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* 🚀 Royal Purple & Soft Rose Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-violet-700 to-pink-600 text-white p-8 sm:p-10 soft-shadow animate-gradient-bg">
        
        {/* Floating Glowing Orbs in Background */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-white/15 rounded-full blur-3xl animate-float pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase text-purple-100 border border-white/30 shadow-sm animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Student Online Fee Portal • Academic Session {feesConfig.academicYear}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-pink-200">{currentUser?.fullName || formData.fullName || 'Student'}</span> 👋
            </h1>

          </div>

          {/* Right Stats Card Overlay */}
          <div className="w-full lg:w-auto bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/25 shadow-2xl min-w-[280px]">
            
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-purple-100 font-bold uppercase tracking-wider">Fee Payment Progress</span>
              <span className="font-extrabold text-amber-300 bg-white/20 px-2 py-0.5 rounded-full">{completionPercentage}% Completed</span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-3 mb-4 p-0.5 border border-white/20 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-400 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                <p className="text-purple-200 font-semibold">Total Paid</p>
                <p className="text-lg font-black text-emerald-300">₹{totalPaidAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                <p className="text-purple-200 font-semibold">Remaining Due</p>
                <p className="text-lg font-black text-amber-200">₹{remainingDues.toLocaleString('en-IN')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 📊 Interactive Step-by-Step Workflow Bar */}
      <div className="bg-white rounded-3xl p-5 border border-purple-200/60 shadow-sm glass-panel-glow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Step 1 */}
          <div className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
            formSubmitted 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-purple-50/70 border-purple-200 text-purple-900 ring-2 ring-purple-500/20'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
              formSubmitted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-purple-600 text-white'
            }`}>
              {formSubmitted ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider opacity-75">Step 1</p>
              <p className="text-sm font-extrabold">{formSubmitted ? 'Student Profile Saved' : 'Fill Profile Form'}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
            (isTuitionPaid || isCollegePaid)
              ? 'bg-violet-50/70 border-violet-200 text-violet-900'
              : 'bg-purple-50/30 border-purple-100 text-slate-700'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
              (isTuitionPaid || isCollegePaid) ? 'bg-violet-600 text-white' : 'bg-purple-200 text-purple-700'
            }`}>
              2
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider opacity-75">Step 2</p>
              <p className="text-sm font-extrabold">Select Fee Option</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
            (isTuitionPaid && isCollegePaid)
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-purple-50/30 border-purple-100 text-slate-700'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
              (isTuitionPaid && isCollegePaid) ? 'bg-emerald-600 text-white' : 'bg-purple-200 text-purple-700'
            }`}>
              {(isTuitionPaid && isCollegePaid) ? <Check className="w-5 h-5" /> : '3'}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider opacity-75">Step 3</p>
              <p className="text-sm font-extrabold">Razorpay Checkout & Receipt</p>
            </div>
          </div>

        </div>
      </div>

      {/* Grid Section: Student Form (Google Form style) + Fee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 Cols): Google Form Style Student Profile Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-200/80 shadow-sm glass-panel-glow relative overflow-hidden">
            
            {/* Top Decorative Color Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600"></div>

            <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 text-purple-600 flex items-center justify-center font-bold shadow-sm border border-purple-200/60">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Student Profile Form</h2>
                  <p className="text-xs text-slate-500 font-medium">Google Form style details submission</p>
                </div>
              </div>

              {formSubmitted && !isEditingForm && (
                <button
                  onClick={() => setIsEditingForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-purple-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Form</span>
                </button>
              )}
            </div>

            {/* Submission Status Badge */}
            {formSubmitted && !isEditingForm ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-500/20">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-900">Student Details Linked & Saved!</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Your PRN and Roll No are mapped for fee receipts.</p>
                  </div>
                </div>

                <div className="space-y-3 bg-purple-50/40 p-5 rounded-2xl border border-purple-100/80 text-xs">
                  <div className="flex justify-between border-b border-purple-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Full Name:</span>
                    <span className="font-extrabold text-slate-900">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Roll Number:</span>
                    <span className="font-mono font-extrabold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded border border-purple-200">{formData.rollNo}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">PRN Number:</span>
                    <span className="font-mono font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded border border-purple-200">{formData.prnNo}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Course & Branch:</span>
                    <span className="font-bold text-slate-900">{formData.educationDetails?.course}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Year & Semester:</span>
                    <span className="font-bold text-slate-900">{formData.educationDetails?.year} ({formData.educationDetails?.semester})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Gmail ID:</span>
                    <span className="font-bold text-slate-900">{formData.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Student Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS2026-042"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold text-purple-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">PRN Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20240325001192"
                      value={formData.prnNo}
                      onChange={(e) => setFormData({ ...formData, prnNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Course / Degree *</label>
                  <select
                    value={formData.educationDetails?.course}
                    onChange={(e) => setFormData({
                      ...formData,
                      educationDetails: { ...formData.educationDetails, course: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all bg-white"
                  >
                    <option>B.Tech Computer Science</option>
                    <option>B.Tech Information Technology</option>
                    <option>B.Tech Mechanical Engineering</option>
                    <option>B.Tech Electronics & Telecom</option>
                    <option>BCA / MCA</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Year</label>
                    <select
                      value={formData.educationDetails?.year}
                      onChange={(e) => setFormData({
                        ...formData,
                        educationDetails: { ...formData.educationDetails, year: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold bg-white"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Semester</label>
                    <select
                      value={formData.educationDetails?.semester}
                      onChange={(e) => setFormData({
                        ...formData,
                        educationDetails: { ...formData.educationDetails, semester: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold bg-white"
                    >
                      <option>1st Semester</option>
                      <option>2nd Semester</option>
                      <option>3rd Semester</option>
                      <option>4th Semester</option>
                      <option>5th Semester</option>
                      <option>6th Semester</option>
                      <option>7th Semester</option>
                      <option>8th Semester</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.educationDetails?.mobile}
                    onChange={(e) => setFormData({
                      ...formData,
                      educationDetails: { ...formData.educationDetails, mobile: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all shimmer-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Student Profile Details</span>
                </button>

              </form>
            )}

          </div>
        </div>

        {/* Right Column (7 Cols): 2 Admin-Configured Fee Options & Payment Trigger */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">College Fee Structure</h2>
              <p className="text-xs text-slate-500 font-medium">Select fee option added by Admin and complete Razorpay payment</p>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200/80 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Razorpay Verified</span>
            </div>
          </div>

          {/* Fee Cards Grid (2 Options as explicitly requested) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* OPTION 1: Tuition Fee */}
            <div className={`relative bg-white rounded-3xl p-6 border transition-all card-hover-3d glass-panel-glow ${
              isTuitionPaid ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-purple-200/80'
            }`}>
              
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Option 1
                </span>
                {isTuitionPaid ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3 h-3" /> PAID
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Mandatory
                  </span>
                )}
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 text-purple-600 flex items-center justify-center font-bold mb-4 shadow-sm border border-purple-200/60">
                <CreditCard className="w-7 h-7 text-purple-600" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">Tuition Fee</h3>
              <p className="text-xs text-slate-500 font-medium mb-5 min-h-[32px]">
                {feesConfig.tuitionDescription}
              </p>

              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 mb-6">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
                    ₹{feesConfig.tuitionFee?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold pt-1 border-t border-purple-100">
                  <Clock className="w-3 h-3 text-amber-600" /> Due Date: {feesConfig.tuitionDueDate}
                </div>
              </div>

              {isTuitionPaid ? (
                <button
                  onClick={() => onViewInvoice(tuitionPaymentRecord)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-200/80 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Paid Fee Receipt</span>
                </button>
              ) : (
                <button
                  onClick={() => onInitiatePayment({
                    feeType: 'tuitionFee',
                    feeTitle: 'Tuition Fee',
                    amount: feesConfig.tuitionFee
                  })}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all shimmer-btn"
                >
                  <span>Pay ₹{feesConfig.tuitionFee?.toLocaleString('en-IN')} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* OPTION 2: College Fee */}
            <div className={`relative bg-white rounded-3xl p-6 border transition-all card-hover-3d glass-panel-glow ${
              isCollegePaid ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-purple-200/80'
            }`}>
              
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  Option 2
                </span>
                {isCollegePaid ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3 h-3" /> PAID
                  </span>
                ) : (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Annual
                  </span>
                )}
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-100 text-pink-600 flex items-center justify-center font-bold mb-4 shadow-sm border border-pink-200/60">
                <Award className="w-7 h-7 text-pink-600" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">College Fee</h3>
              <p className="text-xs text-slate-500 font-medium mb-5 min-h-[32px]">
                {feesConfig.collegeDescription}
              </p>

              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 mb-6">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700">
                    ₹{feesConfig.collegeFee?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold pt-1 border-t border-purple-100">
                  <Clock className="w-3 h-3 text-amber-600" /> Due Date: {feesConfig.collegeDueDate}
                </div>
              </div>

              {isCollegePaid ? (
                <button
                  onClick={() => onViewInvoice(collegePaymentRecord)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-200/80 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Paid Fee Receipt</span>
                </button>
              ) : (
                <button
                  onClick={() => onInitiatePayment({
                    feeType: 'collegeFee',
                    feeTitle: 'College Fee',
                    amount: feesConfig.collegeFee
                  })}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all shimmer-btn"
                >
                  <span>Pay ₹{feesConfig.collegeFee?.toLocaleString('en-IN')} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm glass-panel-glow">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900">My Fee Payment Receipts & Audit History</h3>
                <p className="text-xs text-slate-500 font-medium">All completed Razorpay payment receipts</p>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {myPayments.length} Completed
              </span>
            </div>

            {myPayments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200 space-y-2">
                <CreditCard className="w-10 h-10 mx-auto opacity-40 text-purple-400" />
                <p className="text-xs font-extrabold text-slate-600">No payment history found yet.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Select any of the fee options above to initiate your instant Razorpay payment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/70 text-purple-900 font-bold uppercase border-b border-purple-200">
                    <tr>
                      <th className="py-3.5 px-4">Fee Particular</th>
                      <th className="py-3.5 px-4">Razorpay Payment ID</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100 font-medium">
                    {myPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900">{pay.feeTitle}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold bg-emerald-50 px-2">{pay.razorpayPaymentId}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">₹{pay.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-slate-600">{pay.paymentMethod}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onViewInvoice(pay)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-slate-900 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
