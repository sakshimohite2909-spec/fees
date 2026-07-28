import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle, Clock, FileText, 
  Sparkles, Award, ArrowRight, ShieldCheck, Download, Edit3, Save, Check,
  Phone, BookOpen, Layers, Zap, Building2, CheckCircle2, ChevronRight, User, Hash,
  Search, UserPlus, AlertCircle, X
} from 'lucide-react';

export default function StudentDashboard({ 
  currentUser, 
  feesConfig, 
  students, 
  payments, 
  onSaveStudent, 
  onInitiatePayment,
  onViewInvoice,
  onOpenAuth,
  onStepChange
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

  // Wizard step state: 'mobile' | 'confirm-course' | 'new-student' | 'dashboard'
  const [step, setStep] = useState(() => {
    if (currentUser || existingProfile?.mobile) return 'dashboard';
    return 'mobile';
  });

  const [mobileSearchInput, setMobileSearchInput] = useState('');
  const [matchedStudentRecord, setMatchedStudentRecord] = useState(null);

  const [mobileInput, setMobileInput] = useState(defaultMobile);
  const [selectedCourse, setSelectedCourse] = useState(defaultCourse);
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [fullName, setFullName] = useState(existingProfile?.fullName || currentUser?.fullName || 'Sakshi Patil');
  const [rollNo, setRollNo] = useState(existingProfile?.rollNo || 'CS2026-042');
  const [prnNo, setPrnNo] = useState(existingProfile?.prnNo || '20240325001192');
  const [year, setYear] = useState(existingProfile?.educationDetails?.year || '3rd Year');
  const [semester, setSemester] = useState(existingProfile?.educationDetails?.semester || '5th Semester');

  // Track if mobile number has been submitted to open the student details page
  const [isMobileSubmitted, setIsMobileSubmitted] = useState(!!currentUser && !!existingProfile?.mobile);
  const [showEditForm, setShowEditForm] = useState(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser && existingProfile) {
      setMobileInput(existingProfile.mobile || existingProfile.educationDetails?.mobile || '');
      setSelectedCourse(getNormalizedCourse(existingProfile.educationDetails?.course));
      setSelectedBranch(existingProfile.educationDetails?.branch || 'Computer Engineering');
      setFullName(existingProfile.fullName || currentUser?.fullName || '');
      setRollNo(existingProfile.rollNo || '');
      setPrnNo(existingProfile.prnNo || '');
      setYear(existingProfile.educationDetails?.year || '3rd Year');
      setSemester(existingProfile.educationDetails?.semester || '5th Semester');
      setIsMobileSubmitted(true);
      setStep('dashboard');
    }
  }, [currentUser, existingProfile]);

  const handleCourseChange = (newCourse) => {
    setSelectedCourse(newCourse);
    if (newCourse === 'Engineering') {
      setSelectedBranch('');
    } else {
      setSelectedBranch(newCourse);
    }
  };

  const [notFoundMobile, setNotFoundMobile] = useState(null);

  // 1️⃣ STEP 1: Mobile Number Search Handler
  const handleMobileNumberSubmit = (e) => {
    e.preventDefault();
    const query = mobileSearchInput.trim();
    if (!query) return;

    // Search in students database by mobile number (or PRN / Roll No)
    const match = students.find(s => {
      const mob = (s.mobile || s.educationDetails?.mobile || '').replace(/\D/g, '');
      const prn = (s.prnNo || '').toLowerCase();
      const roll = (s.rollNo || '').toLowerCase();
      const searchClean = query.replace(/\D/g, '').toLowerCase();
      return (searchClean && mob.includes(searchClean)) || (query && prn.includes(query.toLowerCase())) || (query && roll.includes(query.toLowerCase()));
    });

    if (match) {
      // MATCH FOUND: Existing Student!
      const matchedMobile = match.mobile || match.educationDetails?.mobile || query;
      const matchedCourse = getNormalizedCourse(match.course || match.educationDetails?.course);
      const matchedBranch = match.branch || match.educationDetails?.branch || 'Computer Engineering';

      setMatchedStudentRecord(match);
      setFullName(match.fullName || 'Student');
      setMobileInput(matchedMobile);
      setSelectedCourse(matchedCourse);
      setSelectedBranch(matchedBranch);
      if (match.rollNo) setRollNo(match.rollNo);
      if (match.prnNo) setPrnNo(match.prnNo);
      setNotFoundMobile(null);

      setStep('confirm-course');
    } else {
      // NO MATCH FOUND: Show clean inline alert!
      setMatchedStudentRecord(null);
      setMobileInput(query);
      setNotFoundMobile(query);
    }
  };

  const handleConfirmRegisterNewStudent = () => {
    setNotFoundMobile(null);
    setFullName('');
    setRollNo(`RN-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrnNo(`2026${Math.floor(10000000 + Math.random() * 90000000)}`);
    setSelectedCourse('');
    setSelectedBranch('');
    setStep('new-student');
  };

  // 2️⃣ STEP 2A: Existing Student Confirm Course & Proceed to Fees
  const handleProceedToFees = (e) => {
    e.preventDefault();
    const studentData = {
      ...(matchedStudentRecord || {}),
      fullName: fullName || 'Student',
      mobile: mobileInput,
      course: selectedCourse,
      branch: selectedBranch,
      rollNo,
      prnNo
    };

    onSaveStudent(studentData);
    setIsMobileSubmitted(true);
    setShowEditForm(false);
    setStep('dashboard');
  };

  // 2️⃣ STEP 2B: New Student Registration Submission & Proceed to Fees
  const handleRegisterNewStudent = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newStudentData = {
      id: `std_${Date.now()}`,
      fullName: fullName.trim(),
      mobile: mobileInput.trim(),
      prnNo: prnNo.trim() || `2026${Math.floor(10000000 + Math.random() * 90000000)}`,
      rollNo: rollNo.trim() || `RN-${Math.floor(1000 + Math.random() * 9000)}`,
      course: selectedCourse,
      branch: selectedBranch,
      email: `${fullName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`,
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

    onSaveStudent(newStudentData);
    setIsMobileSubmitted(true);
    setShowEditForm(false);
    setStep('dashboard');
  };

  // Payment Status checks for student
  const currentStudentId = existingProfile?.id || matchedStudentRecord?.id;
  const currentRollNo = rollNo || existingProfile?.rollNo;

  const myPayments = payments.filter(p => 
    (currentStudentId && p.studentId === currentStudentId) || 
    (currentRollNo && p.rollNo === currentRollNo)
  );

  const isExamPaid = myPayments.some(p => p.feeType === 'examFee' && p.status === 'PAID');
  const isTuitionPaid = myPayments.some(p => p.feeType === 'tuitionFee' && p.status === 'PAID');

  const examPaymentRecord = myPayments.find(p => p.feeType === 'examFee' && p.status === 'PAID');
  const tuitionPaymentRecord = myPayments.find(p => p.feeType === 'tuitionFee' && p.status === 'PAID');

  const totalPaidAmount = myPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const examAmount = feesConfig.examFee || 2500;
  const tuitionAmount = feesConfig.tuitionFee || 45000;

  const totalFeesDue = examAmount + tuitionAmount;
  const remainingDues = Math.max(0, totalFeesDue - totalPaidAmount);
  const completionPercentage = Math.min(100, Math.round((totalPaidAmount / totalFeesDue) * 100));

  // Notify parent component of current wizard step
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* 📱 STEP 1: MOBILE NUMBER SEARCH INPUT */}
      {step === 'mobile' && (
            <div className="card-interactive p-6 sm:p-8 relative overflow-hidden animate-fadeIn max-w-xl mx-auto">
              <div className="space-y-6">
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Student Verification</h2>
                    <p className="text-xs text-slate-500 font-medium">Enter your Mobile Number to access your fee portal.</p>
                  </div>
                </div>

                <form onSubmit={handleMobileNumberSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Enter Mobile Number *</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit Mobile Number"
                        value={mobileSearchInput}
                        onChange={(e) => setMobileSearchInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-slate-50/50 transition-all hover:border-slate-400 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>Next / Submit Mobile Number</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>

                {/* ⚠️ INLINE NOT FOUND ALERT BANNER (No dark screen overlay!) */}
                {notFoundMobile && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-slate-800 space-y-3 animate-slide-up mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">Mobile Number Not Found (+91 {notFoundMobile})</h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          No record found in college database. If you are a new student, click below to register.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-amber-200/60">
                      <button
                        type="button"
                        onClick={handleConfirmRegisterNewStudent}
                        className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Register as New Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotFoundMobile(null)}
                        className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-all cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 🎓 STEP 2A: MATCHED EXISTING STUDENT -> SHOW ONLY NAME & SELECT COURSE */}
          {step === 'confirm-course' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden animate-fadeIn max-w-xl mx-auto">
              <div className="space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Student Verified</h2>
                      <p className="text-xs text-slate-500 font-medium">Record found in college database</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-xs font-semibold text-indigo-600 hover:underline px-2.5 py-1 rounded bg-indigo-50"
                  >
                    Change Number
                  </button>
                </div>

                {/* Display ONLY Student Name */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-medium uppercase text-slate-500 mb-1">Student Name</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>{fullName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">Verified Record</span>
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1">+91 {mobileInput}</p>
                </div>

                {/* Course & Branch Selection */}
                <form onSubmit={handleProceedToFees} className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Select Course *</span>
                    </label>
                    <select
                      required
                      value={selectedCourse}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>-- Select Course --</option>
                      <option value="Engineering">Engineering (B.Tech / B.E.)</option>
                      <option value="Polytechnic">Polytechnic (Diploma)</option>
                      <option value="Pharmacy">Pharmacy (B.Pharm / D.Pharm)</option>
                    </select>
                  </div>

                  {/* Branch Selection (Only shown for Engineering) */}
                  {selectedCourse === 'Engineering' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Select Branch *</span>
                      </label>
                      <select
                        required
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>-- Select Branch --</option>
                        {(COURSE_BRANCHES['Engineering'] || []).map((b) => (
                          <option key={b.id} value={b.label}>
                            {b.label} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>Proceed to View Fees</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                </form>

              </div>
            </div>
          )}

          {/* 🆕 STEP 2B: NEW STUDENT REGISTRATION FORM (When mobile number not found) */}
          {step === 'new-student' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden animate-fadeIn max-w-xl mx-auto">
              <div className="space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Add New Student Profile</h2>
                      <p className="text-xs text-slate-500 font-medium">No record found for +91 {mobileInput}. Fill details to register.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-xs font-semibold text-indigo-600 hover:underline px-2.5 py-1 rounded bg-indigo-50"
                  >
                    Change Number
                  </button>
                </div>

                <form onSubmit={handleRegisterNewStudent} className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Student Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Academic Course *</label>
                    <select
                      required
                      value={selectedCourse}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>-- Select Course --</option>
                      <option value="Engineering">Engineering (B.Tech / B.E.)</option>
                      <option value="Polytechnic">Polytechnic (Diploma)</option>
                      <option value="Pharmacy">Pharmacy (B.Pharm / D.Pharm)</option>
                    </select>
                  </div>

                  {/* Branch Selection (Only shown for Engineering) */}
                  {selectedCourse === 'Engineering' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Select Branch *</label>
                      <select
                        required
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>-- Select Branch --</option>
                        {(COURSE_BRANCHES['Engineering'] || []).map((b) => (
                          <option key={b.id} value={b.label}>
                            {b.label} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Save Student & Proceed to Fees</span>
                  </button>

                </form>

              </div>
            </div>
          )}

      {/* 🎓 STEP 3: MAIN STUDENT DASHBOARD PAGE (Visible after Student Search / Login) */}
      {step === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">

          {/* 📋 SECTION 1: Student Information Display Card */}
          <div className="card-interactive p-4 sm:p-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Student Profile</h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Student
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Verified details linked to mobile number</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowEditForm(true);
                  setStep(matchedStudentRecord ? 'confirm-course' : 'new-student');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all border border-slate-200 hover:border-indigo-300 cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Grid */}
            <div className="mt-4 p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Student Name
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{fullName || 'Sakshi Patil'}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Mobile Number
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono">+91 {mobileInput}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Course & Branch</p>
                <p className="text-xs font-bold text-slate-900 break-words">{selectedCourse} - <span className="text-indigo-600">{selectedBranch}</span></p>
              </div>

            </div>

          </div>

          {/* 💳 SECTION 2: Exam Fee & Tuition Fee Display & Razorpay Checkout */}
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Fee Structure & Payments</h3>
                <p className="text-xs text-slate-500 font-medium">Exam Fee & Tuition Fee for session {feesConfig.academicYear || '2026-2027'}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50/70 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Razorpay Secured</span>
              </div>
            </div>

            {/* Fee Cards Grid (Exam Fee & Tuition Fee) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* CARD 1: EXAM FEE */}
              <div className={`card-interactive p-5 flex flex-col justify-between ${
                isExamPaid ? 'border-emerald-300 bg-emerald-50/20' : ''
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Exam Fee
                    </span>
                    {isExamPaid ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due Soon
                      </span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 border border-indigo-100">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-0.5">Exam Fee</h4>
                  <p className="text-xs text-slate-500 font-medium mb-3 min-h-[32px]">
                    {feesConfig.examDescription || 'Semester Examination & Hall Ticket Fee'}
                  </p>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Amount</span>
                      <span className="text-xl font-bold text-slate-900">
                        ₹{examAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium pt-1 border-t border-slate-200/80">
                      <Clock className="w-3 h-3 text-slate-400" /> Due: {feesConfig.examDueDate || '2026-08-25'}
                    </div>
                  </div>
                </div>

                {isExamPaid ? (
                  <button
                    onClick={() => onViewInvoice(examPaymentRecord)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Receipt</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onInitiatePayment({
                      feeType: 'examFee',
                      feeTitle: 'Exam Fee',
                      amount: examAmount
                    })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <span>Pay ₹{examAmount.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {/* CARD 2: TUITION FEE */}
              <div className={`card-interactive p-5 flex flex-col justify-between ${
                isTuitionPaid ? 'border-emerald-300 bg-emerald-50/20' : ''
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Tuition Fee
                    </span>
                    {isTuitionPaid ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Mandatory
                      </span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 border border-indigo-100">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-0.5">Tuition Fee</h4>
                  <p className="text-xs text-slate-500 font-medium mb-3 min-h-[32px]">
                    {feesConfig.tuitionDescription || 'Semester Tuition & Academic Fee'}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Amount</span>
                      <span className="text-xl font-bold text-slate-900">
                        ₹{tuitionAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium pt-1 border-t border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" /> Due: {feesConfig.tuitionDueDate || '2026-08-15'}
                    </div>
                  </div>
                </div>

                {isTuitionPaid ? (
                  <button
                    onClick={() => onViewInvoice(tuitionPaymentRecord)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Receipt</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onInitiatePayment({
                      feeType: 'tuitionFee',
                      feeTitle: 'Tuition Fee',
                      amount: tuitionAmount
                    })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <span>Pay ₹{tuitionAmount.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment Receipts</h3>
                  <p className="text-xs text-slate-500 font-medium">Completed fee payments and downloadable PDF receipts</p>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  {myPayments.length} Receipts
                </span>
              </div>

              {myPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">No payment receipts available yet.</p>
                  <p className="text-[11px] text-slate-400">Select Exam Fee or Tuition Fee above to make your payment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Fee Description</th>
                        <th className="py-3 px-3">Payment ID</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Method</th>
                        <th className="py-3 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {myPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">{pay.feeTitle}</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 font-medium bg-emerald-50/50 px-2 rounded">{pay.razorpayPaymentId}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">₹{pay.amount?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-slate-600">{pay.paymentMethod}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => onViewInvoice(pay)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-300" /> Receipt
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
