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
      
      {/* 🚀 Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-violet-800 to-pink-700 text-white p-8 sm:p-10 soft-shadow animate-gradient-bg">
        
        {/* Glowing Orbs */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase text-purple-100 border border-white/30 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Student Online Fee Portal • Academic Session {feesConfig.academicYear || '2026-2027'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-pink-200">{fullName || currentUser?.fullName || 'Student'}</span> 👋
            </h1>

            <p className="text-purple-100/90 text-sm font-medium">
              Submit your mobile number to view student details, select Course & Branch, and pay Exam Fee & Tuition Fee online.
            </p>
          </div>

          {/* Quick Payment Status Overview */}
          <div className="w-full lg:w-auto bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/25 shadow-2xl min-w-[290px]">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-purple-100 font-bold uppercase tracking-wider">Fee Payment Progress</span>
              <span className="font-extrabold text-amber-300 bg-white/20 px-2.5 py-0.5 rounded-full">{completionPercentage}% Paid</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/25 rounded-full h-3 mb-4 p-0.5 border border-white/20 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-pink-400 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
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

      {/* 📱 STEP 1: MOBILE NUMBER SUBMISSION FORM (Direct Page when mobile not submitted or clicking edit) */}
      {(!isMobileSubmitted || showEditForm) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-lg glass-panel-glow relative overflow-hidden animate-fadeIn">
          
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600"></div>

          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center gap-4 border-b border-purple-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shadow-inner border border-purple-200 shrink-0">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Student Mobile Number & Info Submission</h2>
                <p className="text-xs text-slate-500 font-medium">Enter your registered mobile number below to access your student profile & fees structure page.</p>
              </div>
            </div>

            <form onSubmit={handleMobileSubmit} className="space-y-6">
              
              {/* Mobile Number Entry */}
              <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>Student Mobile Number *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-600">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit Mobile Number (e.g. 9876543210)"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-purple-300 text-base font-extrabold text-slate-900 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 focus:outline-none bg-white transition-all shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-purple-700 font-semibold">Your mobile number will be printed on official fee receipts.</p>
              </div>

              {/* Basic Student Information Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Student Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CS2026-042"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PRN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 20240325001192"
                    value={prnNo}
                    onChange={(e) => setPrnNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year & Semester</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
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
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all shimmer-btn"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Mobile Number & View Information Page</span>
                </button>
                {showEditForm && (
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-6 py-4 rounded-2xl border border-slate-300 font-bold text-xs hover:bg-slate-50 transition-colors text-slate-700"
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
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-200 shadow-sm glass-panel-glow relative overflow-hidden">
            
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
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border border-purple-200"
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                <span>Update Mobile / Profile</span>
              </button>
            </div>

            {/* Unified Single Profile Box */}
            <div className="mt-5 p-5 bg-gradient-to-r from-purple-50/90 via-pink-50/50 to-purple-50/90 rounded-2xl border-2 border-purple-200 divide-y sm:divide-y-0 sm:divide-x divide-purple-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0 shadow-sm">
              
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

              {/* Item 3: Roll & PRN Number */}
              <div className="sm:px-5 space-y-1 pt-3 sm:pt-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Roll & PRN Number</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded">{rollNo || 'CS2026-042'}</span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{prnNo || '20240325001192'}</span>
                </div>
              </div>

              {/* Item 4: Course & Branch */}
              <div className="sm:pl-5 space-y-0.5 pt-3 sm:pt-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Selected Course & Branch</p>
                <p className="text-xs font-black text-slate-900">{selectedCourse}</p>
                <p className="text-xs font-extrabold text-purple-700 truncate">{selectedBranch}</p>
              </div>

            </div>

          </div>

          {/* 📚 SECTION 2: Course Dropdown & Branch Radio Buttons Selection */}
          {/* 📚 SECTION 2: Academic Course & Branch Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-sm glass-panel-glow space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-purple-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Academic Course & Branch Selection</h3>
                  <p className="text-xs text-slate-500 font-medium">Select your course and branch from the options below</p>
                </div>
              </div>

              <span className="text-xs font-black text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
                Selected: <span className="text-pink-600 font-extrabold">{selectedCourse}</span> ({selectedBranch})
              </span>
            </div>

            {/* 🎓 PART 1: 3 COURSES DISPLAY (Engineering, Polytechnic, Pharmacy) */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>1. Select Course *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  { id: 'Engineering', title: 'Engineering (B.Tech / B.E.)', icon: '🎓', badge: '6 Branches' },
                  { id: 'Polytechnic', title: 'Polytechnic (Diploma)', icon: '🏫', badge: 'Diploma' },
                  { id: 'Pharmacy', title: 'Pharmacy (B.Pharm / D.Pharm)', icon: '🧪', badge: 'Pharmacy' }
                ].map((course) => {
                  const isSelected = selectedCourse === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseChange(course.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-purple-600 shadow-md ring-2 ring-purple-500/20'
                          : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/20'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{course.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-purple-950' : 'text-slate-800'}`}>
                          {course.title}
                        </p>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-purple-700' : 'text-slate-500'}`}>
                          {course.badge}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⚡ PART 2: ENGINEERING BRANCHES DISPLAY (Radio Buttons Grid - Only for Engineering) */}
            {selectedCourse === 'Engineering' ? (
              <div className="space-y-3 pt-4 border-t border-purple-100 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-pink-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-pink-600" />
                    <span>2. Select Engineering Branch (Radio Buttons) *</span>
                  </label>
                  <span className="text-[11px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    6 Branches Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(COURSE_BRANCHES['Engineering'] || []).map((branchObj) => {
                    const isSelected = selectedBranch === branchObj.label || 
                      (selectedBranch && branchObj.label.toLowerCase().includes(selectedBranch.toLowerCase()));

                    return (
                      <label
                        key={branchObj.id}
                        onClick={() => {
                          setSelectedBranch(branchObj.label);
                          onSaveStudent({
                            ...existingProfile,
                            email: currentUser?.email || existingProfile?.email,
                            fullName: fullName || existingProfile?.fullName,
                            rollNo: rollNo || existingProfile?.rollNo,
                            prnNo: prnNo || existingProfile?.prnNo,
                            mobile: mobileInput,
                            branch: branchObj.label,
                            course: selectedCourse,
                            educationDetails: {
                              course: selectedCourse,
                              branch: branchObj.label,
                              year,
                              semester,
                              mobile: mobileInput
                            }
                          });
                        }}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-purple-600 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="studentBranchSelection"
                          value={branchObj.label}
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4.5 h-4.5 text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer accent-purple-600 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs font-black truncate ${isSelected ? 'text-purple-950' : 'text-slate-800'}`}>
                              {branchObj.label}
                            </p>
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              {branchObj.code}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* DIRECT PROGRAM BANNER FOR POLYTECHNIC & PHARMACY */
              <div className="pt-4 border-t border-purple-100 animate-fadeIn">
                <div className="bg-emerald-50/80 border-2 border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">{selectedCourse} Selected</h4>
                    <p className="text-xs font-semibold text-emerald-800">
                      Standard direct course layout active. No sub-branches required for {selectedCourse}.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              <div className={`relative bg-white rounded-3xl p-6 border transition-all glass-panel-glow flex flex-col justify-between ${
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
                    <FileText className="w-6 h-6 text-indigo-600" />
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-200 transition-all shadow-sm"
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 hover:from-indigo-800 hover:to-pink-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all shimmer-btn"
                  >
                    <span>Pay ₹{examAmount.toLocaleString('en-IN')} via Razorpay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CARD 2: TUITION FEE */}
              <div className={`relative bg-white rounded-3xl p-6 border transition-all glass-panel-glow flex flex-col justify-between ${
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
                    <CreditCard className="w-6 h-6 text-purple-600" />
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-200 transition-all shadow-sm"
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all shimmer-btn"
                  >
                    <span>Pay ₹{tuitionAmount.toLocaleString('en-IN')} via Razorpay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm glass-panel-glow">
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
