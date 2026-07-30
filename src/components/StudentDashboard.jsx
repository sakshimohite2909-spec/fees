import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle, Clock, FileText, 
  Sparkles, Award, ArrowRight, ShieldCheck, Download, Edit3, Save, Check,
  Phone, BookOpen, Layers, Zap, Building2, CheckCircle2, ChevronRight, User, Hash, GraduationCap,
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

  const [enrolmentSearchInput, setEnrolmentSearchInput] = useState('');
  const [matchedStudentRecord, setMatchedStudentRecord] = useState(null);

  const [mobileInput, setMobileInput] = useState(defaultMobile);
  const [selectedCourse, setSelectedCourse] = useState(defaultCourse);
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [selectedScheme, setSelectedScheme] = useState(existingProfile?.scheme || 'CE-K');
  const [fullName, setFullName] = useState(existingProfile?.fullName || currentUser?.fullName || '');
  const [rollNo, setRollNo] = useState(existingProfile?.rollNo || '');
  const [prnNo, setPrnNo] = useState(existingProfile?.prnNo || '');
  const [year, setYear] = useState(existingProfile?.educationDetails?.year || '2nd Year');
  const [semester, setSemester] = useState(existingProfile?.educationDetails?.semester || '4th Semester');

  // Track if verification step has been submitted
  const [isMobileSubmitted, setIsMobileSubmitted] = useState(!!currentUser && !!existingProfile?.prnNo);
  const [showEditForm, setShowEditForm] = useState(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser && existingProfile) {
      setMobileInput(existingProfile.mobile || existingProfile.educationDetails?.mobile || '');
      setSelectedCourse(getNormalizedCourse(existingProfile.educationDetails?.course));
      setSelectedBranch(existingProfile.educationDetails?.branch || 'N/A');
      setSelectedScheme(existingProfile.scheme || existingProfile.educationDetails?.course || 'CE-K');
      setFullName(existingProfile.fullName || currentUser?.fullName || '');
      setRollNo(existingProfile.rollNo || '');
      setPrnNo(existingProfile.prnNo || '');
      setYear(existingProfile.educationDetails?.year || '2nd Year');
      setSemester(existingProfile.educationDetails?.semester || '4th Semester');
      setIsMobileSubmitted(true);
      setStep('dashboard');
    } else if (!currentUser) {
      setStep('mobile');
      setEnrolmentSearchInput('');
      setMatchedStudentRecord(null);
      setNotFoundEnrolment(null);
      setIsMobileSubmitted(false);
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

  const [notFoundEnrolment, setNotFoundEnrolment] = useState(null);

  // 1️⃣ STEP 1: Enrolment Number Search Handler (Fetch direct Excel student data)
  const handleEnrolmentNumberSubmit = (e) => {
    e.preventDefault();
    const query = enrolmentSearchInput.trim().toLowerCase();
    if (!query) return;

    // Search in students database by Enrolment No (PRN) or Roll No
    const match = students.find(s => {
      const prn = (s.prnNo || '').toLowerCase().trim();
      const roll = (s.rollNo || '').toLowerCase().trim();
      const name = (s.fullName || '').toLowerCase().trim();
      return prn === query || roll === query || (prn && prn.includes(query)) || (name && name.includes(query));
    });

    if (match) {
      // MATCH FOUND in Excel Database!
      const matchedCourse = getNormalizedCourse(match.course || match.educationDetails?.course || match.scheme);
      const matchedBranch = match.branch || match.educationDetails?.branch || (matchedCourse === 'Engineering' ? 'Computer Engineering' : 'N/A');
      const matchedScheme = match.scheme || match.course || matchedCourse;
      const matchedYear = match.year || match.educationDetails?.year || '2nd Year';

      setMatchedStudentRecord(match);
      setFullName(match.fullName || 'Student');
      if (match.mobile) setMobileInput(match.mobile);
      setSelectedCourse(matchedCourse);
      setSelectedBranch(matchedBranch);
      setSelectedScheme(matchedScheme);
      if (match.rollNo) setRollNo(match.rollNo);
      if (match.prnNo) setPrnNo(match.prnNo);
      setYear(matchedYear);
      setNotFoundEnrolment(null);

      // Directly open student fee portal dashboard with fetched Excel data!
      setIsMobileSubmitted(true);
      setStep('dashboard');
    } else {
      // NO MATCH FOUND in Excel Database
      setMatchedStudentRecord(null);
      setNotFoundEnrolment(query);
    }
  };

  const handleConfirmRegisterNewStudent = () => {
    setNotFoundEnrolment(null);
    setFullName('');
    setRollNo(`RN-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrnNo('N/A');
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
      prnNo: prnNo && prnNo !== 'N/A' ? prnNo.trim() : 'N/A',
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
  const currentRollNo = rollNo || existingProfile?.rollNo || matchedStudentRecord?.rollNo;
  const currentPrnNo = prnNo || existingProfile?.prnNo || matchedStudentRecord?.prnNo;
  const currentEmail = currentUser?.email || existingProfile?.email || matchedStudentRecord?.email;

  const myPayments = (payments || []).filter(p => {
    if (currentStudentId && p.studentId === currentStudentId) return true;
    if (currentRollNo && p.rollNo && String(p.rollNo).toLowerCase() === String(currentRollNo).toLowerCase()) return true;
    if (currentPrnNo && p.prnNo && String(p.prnNo).toLowerCase() === String(currentPrnNo).toLowerCase()) return true;
    if (currentEmail && p.email && String(p.email).toLowerCase() === String(currentEmail).toLowerCase()) return true;
    return false;
  });

  const examAmount = feesConfig?.examFee || 2500;
  const tuitionAmount = feesConfig?.tuitionFee || 45000;

  const totalExamPaid = myPayments
    .filter(p => p.feeType === 'examFee' && p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalTuitionPaid = myPayments
    .filter(p => p.feeType === 'tuitionFee' && p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const isExamPaid = totalExamPaid >= examAmount && examAmount > 0;
  const isTuitionPaid = totalTuitionPaid >= tuitionAmount && tuitionAmount > 0;

  const remainingExamDue = Math.max(0, examAmount - totalExamPaid);
  const remainingTuitionDue = Math.max(0, tuitionAmount - totalTuitionPaid);

  const examPaymentRecord = myPayments.find(p => p.feeType === 'examFee' && p.status === 'PAID');
  const tuitionPaymentRecord = myPayments.find(p => p.feeType === 'tuitionFee' && p.status === 'PAID');

  const totalPaidAmount = totalExamPaid + totalTuitionPaid;
  const totalFeesDue = examAmount + tuitionAmount;
  const remainingDues = Math.max(0, totalFeesDue - totalPaidAmount);
  const completionPercentage = totalFeesDue > 0 ? Math.min(100, Math.round((totalPaidAmount / totalFeesDue) * 100)) : 0;

  // Notify parent component of current wizard step
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* 🔢 STEP 1: ENROLMENT NUMBER (PRN) SEARCH INPUT (FULLY MOBILE RESPONSIVE HERO CLONE) */}
      {step === 'mobile' && (
        <div className="relative overflow-hidden w-full min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-8 lg:p-12 animate-fadeIn bg-slate-950">
          
          {/* Full Campus Background Photo */}
          <img 
            src="/college-bg.jpg" 
            alt="Netaji Polytechnic College Campus" 
            className="absolute inset-0 w-full h-full object-cover object-[22%_55%] transition-all duration-500" 
          />
          
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70 lg:bg-gradient-to-r lg:from-slate-950/20 lg:via-transparent lg:to-slate-950/10 pointer-events-none" />

          {/* 🏛️ DESKTOP ONLY: Dark Glassmorphism College Badge on Bottom Left */}
          <div className="hidden lg:block absolute bottom-8 left-8 z-10 max-w-sm">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-2xl flex items-center gap-3.5 text-white">
              <div className="w-12 h-12 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-6 h-6 text-slate-200" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white leading-tight">
                  Netaji Polytechnic College
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Dhule, Maharashtra
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Approved by DTE & MSBTE
                </p>
              </div>
            </div>
          </div>

          {/* 📝 RESPONSIVE LAYOUT CONTAINER */}
          <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
            
            {/* 🏛️ MOBILE ONLY: Dark Glassmorphism College Badge on Top on Mobile */}
            <div className="block lg:hidden w-full max-w-md mx-auto">
              <div className="bg-slate-900/85 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                  <GraduationCap className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">
                    Netaji Polytechnic College
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Dhule, Maharashtra • Approved by DTE & MSBTE
                  </p>
                </div>
              </div>
            </div>

            {/* 📝 Floating White Verification Card */}
            <div className="lg:col-span-6 lg:col-start-7 w-full">
              <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/90 max-w-md mx-auto lg:ml-auto w-full">
                <div className="space-y-5 sm:space-y-6">
                  
                  {/* Header */}
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100/80 shrink-0 text-lg shadow-2xs">
                      <Hash className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                        Student Fee Portal Verification
                      </h2>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEnrolmentNumberSubmit} className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Enter Enrolment Number (PRN No) *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. 25612400241 or 25623600001"
                          value={enrolmentSearchInput}
                          onChange={(e) => setEnrolmentSearchInput(e.target.value)}
                          className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-slate-50/50 transition-all hover:border-slate-400 placeholder:text-slate-400 shadow-2xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.99]"
                    >
                      <span>Verify Enrolment Number</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </form>

                  {/* Register Option */}
                  <div className="pt-3.5 sm:pt-4 border-t border-slate-100 space-y-2.5 sm:space-y-3">
                    <p className="text-center text-xs text-slate-500 font-medium">
                      Don't have an Enrolment Number?
                    </p>
                    <button
                      type="button"
                      onClick={handleConfirmRegisterNewStudent}
                      className="w-full font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all cursor-pointer text-xs"
                    >
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                      <span>Register as New Student</span>
                    </button>
                  </div>

                  {/* Alert Error */}
                  {notFoundEnrolment && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/95 border border-amber-200 text-slate-800 space-y-2 animate-slide-up">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-900">Enrolment No Not Found ("{notFoundEnrolment}")</h4>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                              No matching record found in database. Please check your Enrolment Number or contact Admin.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotFoundEnrolment(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition-all cursor-pointer shrink-0"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
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

            {/* Profile Grid (Fetched directly from Excel Sheet) */}
            <div className="mt-4 p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Student Name
                </p>
                <p className="text-sm font-extrabold text-slate-900 truncate">{fullName || 'Student'}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-indigo-600" /> Enrolment No (PRN)
                </p>
                <p className="text-sm font-bold text-indigo-700 font-mono">{prnNo || 'N/A'}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" /> Scheme / Course
                </p>
                <p className="text-xs font-bold text-slate-900 break-words">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                    {matchedStudentRecord?.scheme || selectedScheme || selectedCourse}
                  </span>
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-400" /> Academic Year
                </p>
                <p className="text-sm font-bold text-slate-900">{year || '2nd Year'}</p>
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
              <div className="flex items-center gap-1.5 bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 px-3 py-1 rounded-full text-xs font-semibold shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Razorpay Secured</span>
              </div>
            </div>

            {/* 📊 Summary Stat Mini-Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card-interactive p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Academic Fee</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">₹{totalFeesDue.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                </div>
              </div>

              <div className="card-interactive p-3.5 flex items-center justify-between border-emerald-200/70 bg-emerald-50/20">
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Paid</p>
                  <p className="text-base font-extrabold text-emerald-700 mt-0.5">₹{totalPaidAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="card-interactive p-3.5 flex items-center justify-between border-amber-200/70 bg-amber-50/20">
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Remaining Dues</p>
                  <p className="text-base font-extrabold text-amber-700 mt-0.5">₹{remainingDues.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
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
                      amount: remainingExamDue > 0 ? remainingExamDue : examAmount
                    })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <span>Pay ₹{(remainingExamDue > 0 ? remainingExamDue : examAmount).toLocaleString('en-IN')}</span>
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
                      amount: remainingTuitionDue > 0 ? remainingTuitionDue : tuitionAmount
                    })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <span>Pay ₹{(remainingTuitionDue > 0 ? remainingTuitionDue : tuitionAmount).toLocaleString('en-IN')}</span>
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
