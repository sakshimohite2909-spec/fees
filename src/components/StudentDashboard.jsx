import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle, Clock, FileText, 
  Sparkles, Award, ArrowRight, ShieldCheck, Download, Edit3, Save, Check,
  Phone, BookOpen, Layers, Zap, Building2, CheckCircle2, ChevronRight, User, Hash
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
  // Course & Branch mapping structure (Only Engineering has sub-branches with radio buttons)
  const COURSE_BRANCHES = {
    'Engineering': [
      { id: 'mech', label: 'Mechanical Engineering', code: 'ME' },
      { id: 'elec', label: 'Electrical Engineering', code: 'EE' },
      { id: 'comp', label: 'Computer Engineering', code: 'CE' },
      { id: 'ai', label: 'Artificial Intelligence (AI)', code: 'AI' },
      { id: 'entc', label: 'Electronics & Telecommunication (ENTC)', code: 'ENTC' },
      { id: 'civil', label: 'Civil Engineering', code: 'CIVIL' }
    ]
  };

  // Helper to ensure selectedCourse is one of Engineering, Polytechnic, Pharmacy
  const getNormalizedCourse = (c) => {
    if (!c) return 'Engineering';
    const str = String(c).toLowerCase();
    if (str.includes('poly') || str.includes('diploma')) return 'Polytechnic';
    if (str.includes('pharm')) return 'Pharmacy';
    return 'Engineering';
  };

  // Find existing student profile or initialize default
  const existingProfile = students.find(s => s.email === currentUser?.email) || null;

  const defaultMobile = existingProfile?.mobile || existingProfile?.educationDetails?.mobile || currentUser?.mobile || '9876543210';
  const defaultCourse = getNormalizedCourse(existingProfile?.educationDetails?.course);
  const defaultBranch = existingProfile?.educationDetails?.branch || 'Computer Engineering';

  // Form & view state
  const [mobileInput, setMobileInput] = useState(defaultMobile);
  const [selectedCourse, setSelectedCourse] = useState(defaultCourse);
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [fullName, setFullName] = useState(existingProfile?.fullName || currentUser?.fullName || 'Sakshi Patil');
  const [rollNo, setRollNo] = useState(existingProfile?.rollNo || 'CS2026-042');
  const [prnNo, setPrnNo] = useState(existingProfile?.prnNo || '20240325001192');
  const [year, setYear] = useState(existingProfile?.educationDetails?.year || '3rd Year');
  const [semester, setSemester] = useState(existingProfile?.educationDetails?.semester || '5th Semester');

  // Track if mobile number has been submitted to open the student details page
  const [isMobileSubmitted, setIsMobileSubmitted] = useState(!!existingProfile?.mobile);
  const [showEditForm, setShowEditForm] = useState(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (existingProfile) {
      setMobileInput(existingProfile.mobile || existingProfile.educationDetails?.mobile || '');
      setSelectedCourse(getNormalizedCourse(existingProfile.educationDetails?.course));
      setSelectedBranch(existingProfile.educationDetails?.branch || 'Computer Engineering');
      setFullName(existingProfile.fullName || currentUser?.fullName || '');
      setRollNo(existingProfile.rollNo || '');
      setPrnNo(existingProfile.prnNo || '');
      setYear(existingProfile.educationDetails?.year || '3rd Year');
      setSemester(existingProfile.educationDetails?.semester || '5th Semester');
      if (existingProfile.mobile) {
        setIsMobileSubmitted(true);
      }
    }
  }, [currentUser, existingProfile]);

  // 🛡️ BROWSER BACK BUTTON (POPSTATE) HANDLER - Prevents website from closing abruptly on Back Arrow click
  useEffect(() => {
    // Push an initial history entry into browser history
    window.history.pushState({ appSection: 'student-portal' }, '');

    const handlePopState = (e) => {
      if (showEditForm) {
        // If edit modal/form is open, close edit form and stay on dashboard
        setShowEditForm(false);
        window.history.pushState({ appSection: 'student-dashboard' }, '');
      } else if (isMobileSubmitted) {
        // If on main dashboard, go back to initial Student Information submission form
        setIsMobileSubmitted(false);
        window.history.pushState({ appSection: 'student-form' }, '');
      } else {
        // If on initial form, keep user on form instead of exiting website
        window.history.pushState({ appSection: 'student-portal' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobileSubmitted, showEditForm]);

  const handleCourseChange = (newCourse) => {
    setSelectedCourse(newCourse);
    if (newCourse === 'Engineering') {
      const availableBranches = COURSE_BRANCHES['Engineering'];
      const exists = availableBranches.some(b => b.label === selectedBranch);
      if (!exists) {
        setSelectedBranch('Computer Engineering');
      }
    } else {
      setSelectedBranch(newCourse);
    }
  };

  // Handle Mobile Number Submission (opens main details & fees page)
  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (!mobileInput.trim()) return;

    const updatedData = {
      id: existingProfile?.id || `std_${Date.now()}`,
      email: currentUser?.email || `${(fullName || 'student').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      fullName: fullName || currentUser?.fullName || 'Student',
      rollNo: rollNo || `RN-${Math.floor(1000 + Math.random() * 9000)}`,
      prnNo: prnNo || `2026${Math.floor(10000000 + Math.random() * 90000000)}`,
      mobile: mobileInput.trim(),
      branch: selectedBranch,
      course: selectedCourse,
      year,
      semester,
      educationDetails: {
        course: selectedCourse,
        branch: selectedBranch,
        year,
        semester,
        mobile: mobileInput.trim(),
        collegeName: 'Government Engineering & Technology College'
      }
    };

    onSaveStudent(updatedData);
    window.history.pushState({ appSection: 'dashboard' }, '');
    setIsMobileSubmitted(true);
    setShowEditForm(false);
  };

  // Payment Status checks for student
  const currentStudentId = existingProfile?.id;
  const currentRollNo = rollNo || existingProfile?.rollNo;

  const myPayments = payments.filter(p => 
    (currentStudentId && p.studentId === currentStudentId) || 
    (currentRollNo && p.rollNo === currentRollNo)
  );

  const isExamPaid = myPayments.some(p => p.feeType === 'examFee' && p.status === 'PAID');
  const isTuitionPaid = myPayments.some(p => p.feeType === 'tuitionFee' && p.status === 'PAID');
  const isCollegePaid = myPayments.some(p => p.feeType === 'collegeFee' && p.status === 'PAID');

  const examPaymentRecord = myPayments.find(p => p.feeType === 'examFee' && p.status === 'PAID');
  const tuitionPaymentRecord = myPayments.find(p => p.feeType === 'tuitionFee' && p.status === 'PAID');
  const collegePaymentRecord = myPayments.find(p => p.feeType === 'collegeFee' && p.status === 'PAID');

  const totalPaidAmount = myPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const examAmount = feesConfig.examFee || 2500;
  const tuitionAmount = feesConfig.tuitionFee || 45000;

  const totalFeesDue = examAmount + tuitionAmount;
  const remainingDues = Math.max(0, totalFeesDue - totalPaidAmount);
  const completionPercentage = Math.min(100, Math.round((totalPaidAmount / totalFeesDue) * 100));

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* 🚀 Hero Header Banner (Light Pastel Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100/90 via-pink-50/80 to-purple-100/90 text-slate-900 p-8 sm:p-10 border-2 border-purple-200/90 shadow-sm animate-fadeIn card-attractive-hover">
        
        {/* Glowing Soft Orbs */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-pink-200/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-xs font-black tracking-wider uppercase text-purple-900 border border-purple-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              <span>Student Online Fee Portal • Academic Session {feesConfig.academicYear || '2026-2027'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800">{fullName || currentUser?.fullName || 'Student'}</span> 👋
            </h1>
          </div>

          {/* Quick Payment Status Overview */}
          <div className="w-full lg:w-auto bg-white/90 p-5 sm:p-6 rounded-3xl border border-purple-200/90 shadow-md min-w-[290px] card-hover-3d">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-purple-950 font-black uppercase tracking-wider">Fee Payment Progress</span>
              <span className="font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">{completionPercentage}% Paid</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-purple-100 rounded-full h-3 mb-4 p-0.5 border border-purple-200 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <p className="text-emerald-900 font-extrabold text-[10px] uppercase">Total Paid</p>
                <p className="text-lg font-black text-emerald-700">₹{totalPaidAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <p className="text-amber-900 font-extrabold text-[10px] uppercase">Remaining Due</p>
                <p className="text-lg font-black text-amber-700">₹{remainingDues.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 📱 STEP 1: MOBILE NUMBER SUBMISSION FORM (Direct Page when mobile not submitted or clicking edit) */}
      {(!isMobileSubmitted || showEditForm) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-lg glass-panel-glow relative overflow-hidden animate-fadeIn card-attractive-hover">
          
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600"></div>

          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center gap-4 border-b border-purple-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shadow-inner border border-purple-200 shrink-0 animate-bounce-short">
                <User className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Student Information</h2>
                <p className="text-xs text-slate-500 font-medium">Please enter your student details to view your profile and fee breakdown page.</p>
              </div>
            </div>

            <form onSubmit={handleMobileSubmit} className="space-y-6">
              
              {/* Basic Student Information Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Student Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Student Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white transition-all hover:border-purple-300"
                  />
                </div>

                {/* 2. Mobile Number (Next to Student Full Name!) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mobile Number *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-600">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Enter 10-digit Mobile Number"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-purple-300 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white transition-all hover:border-purple-400"
                    />
                  </div>
                </div>

                {/* 3. Academic Course Selection Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>Select Academic Course *</span>
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 text-xs font-extrabold text-slate-900 bg-purple-50/40 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer transition-all hover:border-purple-400"
                  >
                    <option value="Engineering">Engineering (B.Tech / B.E.)</option>
                    <option value="Polytechnic">Polytechnic (Diploma)</option>
                    <option value="Pharmacy">Pharmacy (B.Pharm / D.Pharm)</option>
                  </select>
                </div>

                {/* 4. Branch Selection Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-pink-600" />
                    <span>Select Branch *</span>
                  </label>
                  {selectedCourse === 'Engineering' ? (
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-300 text-xs font-extrabold text-slate-900 bg-pink-50/40 focus:ring-2 focus:ring-pink-500 focus:outline-none cursor-pointer transition-all hover:border-pink-400"
                    >
                      {(COURSE_BRANCHES['Engineering'] || []).map((branchObj) => (
                        <option key={branchObj.id} value={branchObj.label}>
                          {branchObj.label} ({branchObj.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-extrabold text-emerald-950 flex items-center justify-between">
                      <span>{selectedCourse} Direct Program</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                </div>

              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 hover:from-purple-200 hover:via-pink-200 hover:to-purple-200 text-purple-950 font-black text-base border-2 border-purple-300 shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CheckCircle className="w-5 h-5 text-purple-700" />
                  <span>Login</span>
                </button>
                {showEditForm && (
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-6 py-4 rounded-2xl border border-purple-200 font-bold text-xs hover:bg-purple-50 transition-colors text-purple-900 bg-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>

          </div>

        </div>
      )}

      {/* 🎓 STEP 2: MAIN STUDENT DASHBOARD PAGE (Visible after Mobile Number Submit) */}
      {(isMobileSubmitted && !showEditForm) && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* 📋 SECTION 1: Student Information Display Card (with Mobile Number) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-200 shadow-sm glass-panel-glow relative overflow-hidden card-attractive-hover">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-purple-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-500/20">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">Student Profile Information</h2>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Student
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Verified details linked to mobile number</p>
                </div>
              </div>

              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-purple-700 hover:bg-purple-100 rounded-xl transition-all border border-purple-200 shadow-xs hover:shadow"
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                <span>Update Mobile / Profile</span>
              </button>
            </div>

            {/* Unified Single Profile Box */}
            <div className="mt-5 p-5 bg-gradient-to-r from-purple-50/90 via-pink-50/50 to-purple-50/90 rounded-2xl border-2 border-purple-200 divide-y sm:divide-y-0 sm:divide-x divide-purple-200 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 shadow-sm">
              
              {/* Item 1: Student Full Name */}
              <div className="sm:pr-5 space-y-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" /> Student Full Name
                </p>
                <p className="text-base font-black text-slate-900 truncate">{fullName || 'Sakshi Patil'}</p>
              </div>

              {/* Item 2: Submitted Mobile Number */}
              <div className="sm:px-5 space-y-1 pt-3 sm:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-purple-600" /> Mobile Number
                  </p>
                  <span className="text-[9px] bg-purple-600 text-white font-black px-1.5 py-0.2 rounded">VERIFIED</span>
                </div>
                <p className="text-base font-black text-purple-950 font-mono tracking-wide">+91 {mobileInput}</p>
              </div>

              {/* Item 3: Course & Branch */}
              <div className="sm:pl-5 space-y-0.5 pt-3 sm:pt-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Selected Course & Branch</p>
                <p className="text-xs font-black text-slate-900">{selectedCourse}</p>
                <p className="text-xs font-extrabold text-purple-700 truncate">{selectedBranch}</p>
              </div>

            </div>

          </div>



          {/* 💳 SECTION 3: Exam Fee & Tuition Fee Display & Razorpay Checkout */}
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Academic Fee Structure & Payment Options</h3>
                <p className="text-xs text-slate-500 font-medium">Exam Fee & Tuition Fee configured for session {feesConfig.academicYear || '2026-2027'}</p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Razorpay Gateway Verified</span>
              </div>
            </div>

            {/* Fee Cards Grid (Exam Fee & Tuition Fee) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* CARD 1: EXAM FEE */}
              <div className={`relative bg-white rounded-3xl p-6 border transition-all glass-panel-glow flex flex-col justify-between card-attractive-hover ${
                isExamPaid ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-purple-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Exam Fee
                    </span>
                    {isExamPaid ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due Soon
                      </span>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 text-indigo-700 flex items-center justify-center font-bold mb-4 shadow-sm border border-indigo-200">
                    <FileText className="w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>

                  <h4 className="text-xl font-black text-slate-900 mb-1">Exam Fee</h4>
                  <p className="text-xs text-slate-500 font-medium mb-4 min-h-[32px]">
                    {feesConfig.examDescription || 'Semester Examination & Hall Ticket Fee'}
                  </p>

                  <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">
                        ₹{examAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-bold pt-1 border-t border-indigo-100">
                      <Clock className="w-3 h-3 text-indigo-600" /> Due: {feesConfig.examDueDate || '2026-08-25'}
                    </div>
                  </div>
                </div>

                {isExamPaid ? (
                  <button
                    onClick={() => onViewInvoice(examPaymentRecord)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-200 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Exam Fee Receipt</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onInitiatePayment({
                      feeType: 'examFee',
                      feeTitle: 'Exam Fee',
                      amount: examAmount
                    })}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-950 font-black text-xs border-2 border-indigo-300 shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>Pay ₹{examAmount.toLocaleString('en-IN')} via Razorpay</span>
                    <ArrowRight className="w-4 h-4 text-indigo-700" />
                  </button>
                )}
              </div>

              {/* CARD 2: TUITION FEE */}
              <div className={`relative bg-white rounded-3xl p-6 border transition-all glass-panel-glow flex flex-col justify-between card-attractive-hover ${
                isTuitionPaid ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-purple-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Tuition Fee
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

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 text-purple-600 flex items-center justify-center font-bold mb-4 shadow-sm border border-purple-200">
                    <CreditCard className="w-6 h-6 text-purple-600 animate-pulse" />
                  </div>

                  <h4 className="text-xl font-black text-slate-900 mb-1">Tuition Fee</h4>
                  <p className="text-xs text-slate-500 font-medium mb-4 min-h-[32px]">
                    {feesConfig.tuitionDescription || 'Semester Tuition & Academic Fee'}
                  </p>

                  <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 mb-5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
                        ₹{tuitionAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-700 font-bold pt-1 border-t border-purple-100">
                      <Clock className="w-3 h-3 text-purple-600" /> Due: {feesConfig.tuitionDueDate || '2026-08-15'}
                    </div>
                  </div>
                </div>

                {isTuitionPaid ? (
                  <button
                    onClick={() => onViewInvoice(tuitionPaymentRecord)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-200 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Tuition Fee Receipt</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onInitiatePayment({
                      feeType: 'tuitionFee',
                      feeTitle: 'Tuition Fee',
                      amount: tuitionAmount
                    })}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 hover:from-purple-200 hover:to-pink-200 text-purple-950 font-black text-xs border-2 border-purple-300 shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>Pay ₹{tuitionAmount.toLocaleString('en-IN')} via Razorpay</span>
                    <ArrowRight className="w-4 h-4 text-purple-700" />
                  </button>
                )}
              </div>

            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm glass-panel-glow card-attractive-hover">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">Fee Payment History & PDF Receipts</h3>
                  <p className="text-xs text-slate-500 font-medium">All completed Razorpay payment receipts for this student profile</p>
                </div>
                <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  {myPayments.length} Receipts
                </span>
              </div>

              {myPayments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200 space-y-2">
                  <CreditCard className="w-10 h-10 mx-auto opacity-40 text-purple-400" />
                  <p className="text-xs font-extrabold text-slate-600">No fee payment receipts available yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Select Exam Fee or Tuition Fee above to make your payment via Razorpay.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-purple-50/80 text-purple-950 font-bold uppercase border-b border-purple-200">
                      <tr>
                        <th className="py-3.5 px-4">Fee Description</th>
                        <th className="py-3.5 px-4">Razorpay Payment ID</th>
                        <th className="py-3.5 px-4">Amount Paid</th>
                        <th className="py-3.5 px-4">Method</th>
                        <th className="py-3.5 px-4 text-right">PDF Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100 font-medium">
                      {myPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-purple-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-black text-slate-900">{pay.feeTitle}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold bg-emerald-50 px-2">{pay.razorpayPaymentId}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900">₹{pay.amount?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-slate-600">{pay.paymentMethod}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onViewInvoice(pay)}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-slate-900 text-white font-bold text-[11px] shadow-sm transition-all"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400" /> Print Receipt
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
      )}

    </div>
  );
}
