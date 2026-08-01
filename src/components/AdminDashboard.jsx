import React, { useState } from 'react';
import { 
  ShieldCheck, CreditCard, Users, DollarSign, Edit3,
  Save, CheckCircle, Clock, Search, Filter, Download, Plus, Sparkles,
  FileSpreadsheet, UserPlus, Trash2, Phone, Hash, BookOpen, ArrowLeft,
  UserCheck, CheckSquare, Square, AlertCircle, FileText, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AddStudentModal from './AddStudentModal';
import ExcelUploadModal from './ExcelUploadModal';
import SetFeeStructureModal from './SetFeeStructureModal';

export default function AdminDashboard({ 
  feesConfig, 
  students, 
  payments, 
  onUpdateFeesConfig,
  onUpdateSelectedStudentsFees,
  onAddStudent,
  onImportStudents,
  onClearAllStudents,
  onDeleteStudent,
  onClearAllPayments,
  onDeletePayment,
  onViewInvoice 
}) {
  const [configForm, setConfigForm] = useState(feesConfig);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [saveAlertText, setSaveAlertText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeCourseTab, setActiveCourseTab] = useState('all'); // 'all' | 'Polytechnic' | 'Pharmacy' | 'Engineering'
  const [activeAdminView, setActiveAdminView] = useState('directory'); // 'directory' | 'fee-structure'

  // Dedicated Fee Structure Page Option state: 'all' (Option 1) | 'semester' (Option 2) | 'selected' (Option 3)
  const [feePageApplyMode, setFeePageApplyMode] = useState('all');
  const [feePageTargetSemester, setFeePageTargetSemester] = useState('4th Semester');
  const [feePageTargetYear, setFeePageTargetYear] = useState('2nd Year');
  const [feePageSelectedStudentIds, setFeePageSelectedStudentIds] = useState([]);
  const [feePageStudentSearch, setFeePageStudentSearch] = useState('');

  // Directory Table Selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [modalInitialSelectedIds, setModalInitialSelectedIds] = useState([]);
  const [activeFeeDetailModal, setActiveFeeDetailModal] = useState(null);

  const handleOpenFeeDetail = (std) => {
    const stdPayments = payments.filter(p => 
      (std.id && p.studentId === std.id) || 
      (std.prnNo && std.prnNo !== 'N/A' && p.prnNo === std.prnNo) || 
      (std.rollNo && std.rollNo !== 'N/A' && p.rollNo === std.rollNo)
    );

    const reqTuitionFee = std.customFees?.tuitionFee ?? feesConfig.tuitionFee ?? 45000;
    const reqExamFee = std.customFees?.examFee ?? feesConfig.examFee ?? 2500;
    const reqBacklogFee = std.customFees?.backlogFee ?? feesConfig.backlogFee ?? 0;

    const totalTuitionPaid = stdPayments.filter(p => p.feeType === 'tuitionFee' && p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExamPaid = stdPayments.filter(p => p.feeType === 'examFee' && p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalBacklogPaid = stdPayments.filter(p => p.feeType === 'backlogFee' && p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalReq = reqTuitionFee + reqExamFee + reqBacklogFee;
    const totalPaid = totalTuitionPaid + totalExamPaid + totalBacklogPaid;
    const totalPending = Math.max(0, totalReq - totalPaid);

    setActiveFeeDetailModal({
      student: std,
      reqTuitionFee,
      totalTuitionPaid,
      pendingTuition: Math.max(0, reqTuitionFee - totalTuitionPaid),
      tuitionDueDate: std.customFees?.tuitionDueDate || feesConfig.tuitionDueDate || '15 Oct 2026',

      reqExamFee,
      totalExamPaid,
      pendingExam: Math.max(0, reqExamFee - totalExamPaid),
      examDueDate: std.customFees?.examDueDate || feesConfig.examDueDate || '29 Jul 2026',

      reqBacklogFee,
      totalBacklogPaid,
      pendingBacklog: Math.max(0, reqBacklogFee - totalBacklogPaid),
      backlogDueDate: std.customFees?.backlogDueDate || feesConfig.backlogDueDate || '15 Sep 2026',

      totalReq,
      totalPaid,
      totalPending,
      paymentsList: stdPayments
    });
  };

  // Valid non-dummy students list
  const validStudentsList = students.filter(std => 
    std.fullName && 
    std.fullName !== 'Student' && 
    std.fullName.toLowerCase() !== 'student name' && 
    std.fullName.toLowerCase() !== 'candidate name'
  );

  // Students matching feePageTargetSemester filter
  const semesterMatchingStudentsPage = validStudentsList.filter(std => {
    const stdSem = (std.semester || std.educationDetails?.semester || '').toLowerCase();
    const stdYr = (std.year || std.educationDetails?.year || '').toLowerCase();
    
    const semMatches = feePageTargetSemester === 'All' || stdSem.includes(feePageTargetSemester.toLowerCase());
    const yrMatches = feePageTargetYear === 'All' || stdYr.includes(feePageTargetYear.toLowerCase());

    return semMatches && yrMatches;
  });

  const polytechnicStudents = validStudentsList.filter(s => {
    const c = (s.course || s.educationDetails?.course || 'Polytechnic').toLowerCase();
    return c.includes('poly') || (!c.includes('pharm') && !c.includes('eng'));
  });

  const pharmacyStudents = validStudentsList.filter(s => 
    (s.course || s.educationDetails?.course || '').toLowerCase().includes('pharm')
  );

  const engineeringStudents = validStudentsList.filter(s => {
    const c = (s.course || s.educationDetails?.course || '').toLowerCase();
    return c.includes('eng') || c.includes('b.tech') || c.includes('b.e');
  });

  // Financial Stats calculation taking custom per-student fees into account
  const totalCollected = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalStudents = validStudentsList.length;
  
  const totalExpected = validStudentsList.reduce((acc, std) => {
    const tuition = std.customFees?.tuitionFee ?? feesConfig.tuitionFee ?? 45000;
    const exam = std.customFees?.examFee ?? feesConfig.examFee ?? 2500;
    const backlog = std.customFees?.backlogFee ?? feesConfig.backlogFee ?? 0;
    return acc + tuition + exam + backlog;
  }, 0);
  const totalPending = Math.max(0, totalExpected - totalCollected);

  // Save Config handler for Dedicated Fee Structure Page
  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (feePageApplyMode === 'all') {
      onUpdateFeesConfig({ ...configForm, targetSemester: feePageTargetSemester, targetYear: feePageTargetYear });
      setSaveAlertText('Fee structure updated for all students successfully!');
    } else if (feePageApplyMode === 'semester') {
      const matchingIds = semesterMatchingStudentsPage.map(s => s.id);
      if (matchingIds.length === 0) {
        alert(`No students found matching ${feePageTargetSemester} (${feePageTargetYear}).`);
        return;
      }
      if (onUpdateSelectedStudentsFees) {
        onUpdateSelectedStudentsFees(matchingIds, { ...configForm, targetSemester: feePageTargetSemester, targetYear: feePageTargetYear });
      }
      setSaveAlertText(`Fee structure saved for ${matchingIds.length} student(s) in ${feePageTargetSemester} (${feePageTargetYear})!`);
    } else {
      if (feePageSelectedStudentIds.length === 0) {
        alert('Please select at least 1 student to apply fees.');
        return;
      }
      if (onUpdateSelectedStudentsFees) {
        onUpdateSelectedStudentsFees(feePageSelectedStudentIds, { ...configForm, targetSemester: feePageTargetSemester, targetYear: feePageTargetYear });
      }
      setSaveAlertText(`Custom fee structure saved for ${feePageSelectedStudentIds.length} selected student(s)!`);
    }

    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3500);
  };

  // Export current student directory to Excel (.xlsx) with Separate Sheets
  const handleExportToExcel = () => {
    const createSheetForStudents = (studentList, titleName) => {
      const titleRow = [`NETAJI SUBHASHCHANDRA BOSE EDUCATION TRUST'S NETAJI COLLEGE - ${titleName.toUpperCase()}`];
      const headerRow = ["SRNO", "ENROLMENTNO", "NAME", "SCHEME", "YEAR", "TUITION FEE STATUS", "EXAM FEE STATUS"];

      const dataRows = studentList.map((std, idx) => {
        const stdPayments = payments.filter(p => (std.id && p.studentId === std.id) || (std.prnNo && std.prnNo !== 'N/A' && p.prnNo === std.prnNo) || (std.rollNo && std.rollNo !== 'N/A' && p.rollNo === std.rollNo));
        const tuitionPay = stdPayments.find(p => p.feeType === 'tuitionFee');
        const examPay = stdPayments.find(p => p.feeType === 'examFee');

        const reqTuition = std.customFees?.tuitionFee ?? feesConfig.tuitionFee ?? 45000;
        const reqExam = std.customFees?.examFee ?? feesConfig.examFee ?? 2500;

        return [
          idx + 1,
          std.prnNo || 'N/A',
          std.fullName || 'N/A',
          std.scheme || std.educationDetails?.scheme || 'N/A',
          std.year || std.educationDetails?.year || '2nd Year',
          tuitionPay ? `PAID (₹${tuitionPay.amount})` : `PENDING (₹${reqTuition})`,
          examPay ? `PAID (₹${examPay.amount})` : `PENDING (₹${reqExam})`
        ];
      });

      const worksheet = XLSX.utils.aoa_to_sheet([titleRow, [], headerRow, ...dataRows]);
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
      ];
      return worksheet;
    };

    const workbook = XLSX.utils.book_new();

    if (validStudentsList.length > 0) {
      const allSheet = createSheetForStudents(validStudentsList, 'All Students');
      XLSX.utils.book_append_sheet(workbook, allSheet, 'All_Students');
    }
    if (polytechnicStudents.length > 0) {
      const polySheet = createSheetForStudents(polytechnicStudents, 'Polytechnic');
      XLSX.utils.book_append_sheet(workbook, polySheet, 'Polytechnic');
    }
    if (pharmacyStudents.length > 0) {
      const pharmSheet = createSheetForStudents(pharmacyStudents, 'Pharmacy');
      XLSX.utils.book_append_sheet(workbook, pharmSheet, 'Pharmacy');
    }
    if (engineeringStudents.length > 0) {
      const engSheet = createSheetForStudents(engineeringStudents, 'Engineering');
      XLSX.utils.book_append_sheet(workbook, engSheet, 'Engineering');
    }

    if (workbook.SheetNames.length === 0) {
      const emptySheet = createSheetForStudents([], 'All Students');
      XLSX.utils.book_append_sheet(workbook, emptySheet, 'Students_Database');
    }

    XLSX.writeFile(workbook, `College_Students_Fee_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Filter students (exclude dummy / invalid records)
  const filteredStudents = students.filter(std => {
    if (
      !std.fullName || 
      std.fullName === 'Student' || 
      std.fullName.toLowerCase() === 'student name' || 
      std.fullName.toLowerCase() === 'candidate name'
    ) {
      return false;
    }

    const matchesSearch = 
      (std.fullName && std.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.rollNo && std.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.prnNo && std.prnNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.scheme && std.scheme.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.course && std.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.educationDetails?.course && std.educationDetails.course.toLowerCase().includes(searchQuery.toLowerCase()));

    const stdCourse = (std.course || std.educationDetails?.course || 'Polytechnic').toLowerCase();
    const matchesCourseTab = 
      activeCourseTab === 'all' || 
      (activeCourseTab === 'Polytechnic' && (stdCourse.includes('poly') || (!stdCourse.includes('pharm') && !stdCourse.includes('eng')))) ||
      (activeCourseTab === 'Pharmacy' && stdCourse.includes('pharm')) ||
      (activeCourseTab === 'Engineering' && (stdCourse.includes('eng') || stdCourse.includes('b.tech') || stdCourse.includes('b.e')));

    const stdPayments = payments.filter(p => (std.id && p.studentId === std.id) || (std.prnNo && std.prnNo !== 'N/A' && p.prnNo === std.prnNo) || (std.rollNo && std.rollNo !== 'N/A' && p.rollNo === std.rollNo));
    const reqTuition = std.customFees?.tuitionFee ?? feesConfig.tuitionFee ?? 45000;
    const reqExam = std.customFees?.examFee ?? feesConfig.examFee ?? 2500;

    const totalTuitionPaid = stdPayments.filter(p => p.feeType === 'tuitionFee' && p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExamPaid = stdPayments.filter(p => p.feeType === 'examFee' && p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);

    const isFullyPaid = totalTuitionPaid >= reqTuition && totalExamPaid >= reqExam;

    let matchesStatus = true;
    if (statusFilter === 'paid') matchesStatus = isFullyPaid;
    if (statusFilter === 'pending') matchesStatus = !isFullyPaid;

    return matchesSearch && matchesCourseTab && matchesStatus;
  });

  // Table multi-select helper methods
  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id));
  
  const handleToggleSelectAllTable = () => {
    if (isAllFilteredSelected) {
      const filteredIds = filteredStudents.map(s => s.id);
      setSelectedStudentIds(selectedStudentIds.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredStudents.map(s => s.id);
      const union = Array.from(new Set([...selectedStudentIds, ...filteredIds]));
      setSelectedStudentIds(union);
    }
  };

  const handleToggleStudentRow = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleOpenFeeModalForSelected = (specificIds = null) => {
    const idsToPass = specificIds || selectedStudentIds;
    setModalInitialSelectedIds(idsToPass);
    setIsFeeModalOpen(true);
  };

  const searchedStudentsForPage = validStudentsList.filter(std => {
    const q = feePageStudentSearch.toLowerCase();
    return (
      (std.fullName && std.fullName.toLowerCase().includes(q)) ||
      (std.prnNo && std.prnNo.toLowerCase().includes(q)) ||
      (std.scheme && std.scheme.toLowerCase().includes(q)) ||
      (std.course && std.course.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn relative">
      
      {/* 🚀 FLOATING POPUP NOTIFICATION: Save Fee Successfully */}
      {isSavedAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 text-white border-2 border-emerald-400 shadow-2xl backdrop-blur-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 animate-bounce">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">{saveAlertText || 'Fee Structure Saved Successfully! 🎉'}</p>
              <p className="text-[11px] text-emerald-300 font-semibold">Fee amounts have been updated in system database.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Admin Page View Switcher Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs gap-3">
        <div className="flex items-center gap-2">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-slate-900/20">
            <Users className="w-4 h-4" />
            <span>Student Directory</span>
          </div>
        </div>

        {/* Action Button to trigger Set Fee Structure modal overlay directly */}
        <button
          type="button"
          onClick={() => handleOpenFeeModalForSelected([])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-white" />
          <span>Set Fee Structure</span>
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-interactive p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Collected Revenue</p>
            <p className="text-xl font-bold text-slate-900">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="card-interactive p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Dues</p>
            <p className="text-xl font-bold text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="card-interactive p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Students</p>
            <p className="text-xl font-bold text-slate-900">{totalStudents} Total</p>
          </div>
        </div>

        <div className="card-interactive p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-slate-200 shrink-0">
            <CheckCircle className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Transactions</p>
            <p className="text-xl font-bold text-slate-900">{payments.length} Paid</p>
          </div>
        </div>

      </div>

      {/* MAIN STUDENT DIRECTORY VIEW */}
      <div className="space-y-6">
        <div className="card-interactive p-5 sm:p-6">
          
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Directory Excel Sheet</h3>
              <p className="text-xs text-slate-500 font-medium">Name, Enrolment No, Scheme & Year records</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* 📥 Export Excel Report Button */}
              <button
                type="button"
                onClick={handleExportToExcel}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Export Excel (.xlsx)</span>
              </button>

              {/* 📄 Upload Excel Sheet Button */}
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Upload Excel Sheet</span>
              </button>

              {/* ➕ Add Student Manually Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add Student</span>
              </button>

              {/* 🗑️ Clear All Students Button */}
              {onClearAllStudents && students.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all student records? You can upload a fresh Excel sheet anytime.')) {
                      onClearAllStudents();
                    }
                  }}
                  title="Clear all student records"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Clear Data</span>
                </button>
              )}

              </div>
            </div>

            {/* 🎓 Course Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveCourseTab('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  activeCourseTab === 'all'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 ring-2 ring-slate-900/20 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span>All Courses</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeCourseTab === 'all'
                    ? 'bg-white/20 text-white backdrop-blur-xs border border-white/30'
                    : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {validStudentsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCourseTab('Polytechnic')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  activeCourseTab === 'Polytechnic'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-lg shadow-indigo-600/35 ring-2 ring-indigo-500/30 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🎓</span>
                  <span>Polytechnic</span>
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black tracking-tight ${
                  activeCourseTab === 'Polytechnic'
                    ? 'bg-white/25 text-white backdrop-blur-xs border border-white/30 shadow-inner'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100/80'
                }`}>
                  {polytechnicStudents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCourseTab('Pharmacy')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  activeCourseTab === 'Pharmacy'
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-600/35 ring-2 ring-emerald-500/30 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-emerald-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">💊</span>
                  <span>Pharmacy</span>
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black tracking-tight ${
                  activeCourseTab === 'Pharmacy'
                    ? 'bg-white/25 text-white backdrop-blur-xs border border-white/30 shadow-inner'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100/80'
                }`}>
                  {pharmacyStudents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCourseTab('Engineering')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  activeCourseTab === 'Engineering'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg shadow-purple-600/35 ring-2 ring-purple-500/30 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-purple-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">⚙️</span>
                  <span>Engineering</span>
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black tracking-tight ${
                  activeCourseTab === 'Engineering'
                    ? 'bg-white/25 text-white backdrop-blur-xs border border-white/30 shadow-inner'
                    : 'bg-purple-50 text-purple-700 border border-purple-100/80'
                }`}>
                  {engineeringStudents.length}
                </span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by NAME, ENROLMENTNO, SCHEME..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white w-full sm:w-auto"
              >
                <option value="all">All Fee Status</option>
                <option value="paid">Fully Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* 🎯 FLOATING SELECTION BATCH ACTION BAR */}
            {selectedStudentIds.length > 0 && (
              <div className="mb-4 p-3 bg-purple-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-slide-down">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                    {selectedStudentIds.length}
                  </div>
                  <p className="text-xs font-extrabold text-white">
                    {selectedStudentIds.length} Student(s) Selected from Directory
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenFeeModalForSelected(selectedStudentIds)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Set Fees for Selected Student(s)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-purple-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Excel Sheet Table Grid */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={handleToggleSelectAllTable}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">SRNO</th>
                    <th className="py-3 px-3">ENROLMENTNO</th>
                    <th className="py-3 px-3">NAME</th>
                    <th className="py-3 px-3">SCHEME</th>
                    <th className="py-3 px-3">YEAR / SEMESTER</th>
                    <th className="py-3 px-3 text-right">TOTAL PAID</th>
                    <th className="py-3 px-3 text-right">PENDING DUES</th>
                    <th className="py-3 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-slate-400 font-medium bg-slate-50">
                        No student records found in database. Click "Upload Excel Sheet" or "Add Student".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std, idx) => {
                      const isSelected = selectedStudentIds.includes(std.id);
                      const stdPayments = payments.filter(p => 
                        (std.id && p.studentId === std.id) || 
                        (std.prnNo && std.prnNo !== 'N/A' && p.prnNo === std.prnNo) || 
                        (std.rollNo && std.rollNo !== 'N/A' && p.rollNo === std.rollNo)
                      );
                      const totalTuitionPaidForStd = stdPayments
                        .filter(p => p.feeType === 'tuitionFee' && p.status === 'PAID')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);
                      const totalExamPaidForStd = stdPayments
                        .filter(p => p.feeType === 'examFee' && p.status === 'PAID')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);
                      const totalBacklogPaidForStd = stdPayments
                        .filter(p => p.feeType === 'backlogFee' && p.status === 'PAID')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);

                      const reqTuitionFee = std.customFees?.tuitionFee ?? feesConfig.tuitionFee ?? 45000;
                      const reqExamFee = std.customFees?.examFee ?? feesConfig.examFee ?? 2500;
                      const reqBacklogFee = std.customFees?.backlogFee ?? feesConfig.backlogFee ?? 0;

                      const totalRequiredForStd = reqTuitionFee + reqExamFee + reqBacklogFee;
                      const totalPaidForStd = totalTuitionPaidForStd + totalExamPaidForStd + totalBacklogPaidForStd;
                      const pendingDuesForStd = Math.max(0, totalRequiredForStd - totalPaidForStd);

                      const hasCustomFees = std.customFees !== undefined;

                      return (
                        <tr 
                          key={std.id ? `${std.id}_${idx}` : idx} 
                          className={`transition-colors ${
                            isSelected ? 'bg-purple-50/60' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          {/* CHECKBOX */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleStudentRow(std.id)}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                          </td>

                          {/* SRNO */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-700">{idx + 1}</span>
                          </td>

                          {/* ENROLMENTNO */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              {std.prnNo || 'N/A'}
                            </span>
                          </td>

                          {/* NAME */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-900">{std.fullName}</p>
                              {hasCustomFees && (
                                <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  Custom Fee
                                </span>
                              )}
                            </div>
                          </td>

                          {/* SCHEME (Course / Scheme Code) */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100/80">
                              {std.scheme || std.educationDetails?.scheme || std.course || std.educationDetails?.course || 'Polytechnic'}
                            </span>
                          </td>

                          {/* YEAR & SEMESTER */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col text-[11px]">
                              <span className="font-bold text-slate-800">
                                {std.year || std.educationDetails?.year || '2nd Year'}
                              </span>
                              <span className="text-[10px] font-extrabold text-indigo-600">
                                {std.semester || std.educationDetails?.semester || '4th Semester'}
                              </span>
                            </div>
                          </td>

                          {/* TOTAL PAID */}
                          <td className="py-3 px-3 text-right font-extrabold text-emerald-700 font-mono text-xs">
                            ₹{totalPaidForStd.toLocaleString('en-IN')}
                          </td>

                          {/* PENDING DUES */}
                          <td className="py-3 px-3 text-right">
                            {pendingDuesForStd > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleOpenFeeDetail(std)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/90 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs group"
                                title="Click to view detailed fee breakdown"
                              >
                                <Clock className="w-3 h-3 text-rose-600 group-hover:scale-110 transition-transform" />
                                <span>Pending (₹{pendingDuesForStd.toLocaleString('en-IN')})</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenFeeDetail(std)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs group"
                                title="Click to view payment receipts and fee breakdown"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                                <span>Fully Paid</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onDeleteStudent(std.id)}
                                title="Delete Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Record count indicator below table */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-semibold text-slate-900">{filteredStudents.length}</span> student records
              </p>
            </div>

          </div>
        </div>

      {/* Set Fee Structure Modal */}
      <SetFeeStructureModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        feesConfig={feesConfig}
        students={validStudentsList}
        initialSelectedStudentIds={modalInitialSelectedIds}
        onUpdateFeesConfig={(newConfig) => {
          onUpdateFeesConfig(newConfig);
          setConfigForm(newConfig);
        }}
        onUpdateSelectedStudentsFees={(selectedIds, newConfig) => {
          if (onUpdateSelectedStudentsFees) {
            onUpdateSelectedStudentsFees(selectedIds, newConfig);
          }
        }}
      />

      {/* Add Student Manually Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={onAddStudent}
      />

      {/* Excel Sheet Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportSuccess={onImportStudents}
      />

      {/* 🚀 INTERACTIVE STUDENT FEE DETAIL BREAKDOWN MODAL */}
      {activeFeeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Student Fee Breakdown</h3>
                  <p className="text-xs text-slate-300 font-medium">{activeFeeDetailModal.student.fullName} ({activeFeeDetailModal.student.prnNo || 'N/A'})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeeDetailModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Overall Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Required</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">₹{activeFeeDetailModal.totalReq?.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Total Paid</p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">₹{activeFeeDetailModal.totalPaid?.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 text-center">
                  <p className="text-[10px] font-bold text-rose-800 uppercase">Total Dues</p>
                  <p className="text-sm font-black text-rose-700 mt-0.5">₹{activeFeeDetailModal.totalPending?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Detailed Breakdown List for Tuition, Exam, Backlog */}
              <div className="space-y-2.5">
                <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Fee Type Wise Breakdown</p>
                
                <div className="space-y-2 text-xs">
                  {/* Tuition Fee Row */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900">Tuition Fee</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Due Date: {activeFeeDetailModal.tuitionDueDate}</p>
                    </div>
                    <div className="text-right">
                      {activeFeeDetailModal.pendingTuition === 0 ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                          PAID ₹{activeFeeDetailModal.totalTuitionPaid.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-[10px] uppercase">
                          PENDING ₹{activeFeeDetailModal.pendingTuition.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exam Fee Row */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900">Exam Fee</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Due Date: {activeFeeDetailModal.examDueDate}</p>
                    </div>
                    <div className="text-right">
                      {activeFeeDetailModal.pendingExam === 0 ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                          PAID ₹{activeFeeDetailModal.totalExamPaid.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-[10px] uppercase">
                          PENDING ₹{activeFeeDetailModal.pendingExam.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Backlog Fee Row */}
                  {activeFeeDetailModal.reqBacklogFee > 0 && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-slate-900">Backlog Fee</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Due Date: {activeFeeDetailModal.backlogDueDate}</p>
                      </div>
                      <div className="text-right">
                        {activeFeeDetailModal.pendingBacklog === 0 ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                            PAID ₹{activeFeeDetailModal.totalBacklogPaid.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-[10px] uppercase">
                            PENDING ₹{activeFeeDetailModal.pendingBacklog.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History List */}
              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Payment Receipts ({activeFeeDetailModal.paymentsList.length} Paid)
                </p>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                  {activeFeeDetailModal.paymentsList.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium">
                      No payment transactions recorded yet.
                    </div>
                  ) : (
                    activeFeeDetailModal.paymentsList.map((pay, pIdx) => (
                      <div key={pay.id || pIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Paid ₹{pay.amount?.toLocaleString('en-IN')}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">{pay.paymentMethod || 'Razorpay'}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{pay.dateTime || pay.date || 'Paid'}</p>
                        </div>
                        {onViewInvoice && (
                          <button
                            type="button"
                            onClick={() => {
                              onViewInvoice(pay);
                              setActiveFeeDetailModal(null);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-slate-200 transition-all cursor-pointer"
                          >
                            Receipt
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer Modal Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenFeeModalForSelected([activeFeeDetailModal.student.id]);
                    setActiveFeeDetailModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Set / Edit Fees for Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeeDetailModal(null)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
