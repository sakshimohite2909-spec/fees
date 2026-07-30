import React, { useState } from 'react';
import { 
  ShieldCheck, CreditCard, Users, DollarSign, Edit3, 
  Save, CheckCircle, Clock, Search, Filter, Download, Plus, Sparkles,
  FileSpreadsheet, UserPlus, Trash2, Phone, Hash, BookOpen
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AddStudentModal from './AddStudentModal';
import ExcelUploadModal from './ExcelUploadModal';

export default function AdminDashboard({ 
  feesConfig, 
  students, 
  payments, 
  onUpdateFeesConfig,
  onAddStudent,
  onImportStudents,
  onClearAllStudents,
  onDeleteStudent,
  onViewInvoice 
}) {
  const [configForm, setConfigForm] = useState(feesConfig);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeCourseTab, setActiveCourseTab] = useState('all'); // 'all' | 'Polytechnic' | 'Pharmacy' | 'Engineering'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onUpdateFeesConfig(configForm);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Export current student directory to Excel (.xlsx) with Top College Headline Banner
  const handleExportToExcel = () => {
    const titleRow = ["NETAJI SUBHASHCHANDRA BOSE EDUCATION TRUST'S NETAJI POLYTECHNIC COLLEGE"];
    const headerRow = ["SRNO", "ENROLMENTNO", "NAME", "SCHEME", "Year", "TUITION FEE STATUS", "EXAM FEE STATUS"];

    const dataRows = students.map((std, idx) => {
      const stdPayments = payments.filter(p => p.studentId === std.id || p.rollNo === std.rollNo);
      const tuitionPay = stdPayments.find(p => p.feeType === 'tuitionFee');
      const examPay = stdPayments.find(p => p.feeType === 'examFee');

      return [
        idx + 1,
        std.prnNo || 'N/A',
        std.fullName || 'N/A',
        std.course || std.educationDetails?.course || 'Engineering',
        std.year || std.educationDetails?.year || '3rd Year',
        tuitionPay ? `PAID (₹${tuitionPay.amount})` : 'PENDING',
        examPay ? `PAID (₹${examPay.amount})` : 'PENDING'
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([titleRow, [], headerRow, ...dataRows]);
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Database');
    XLSX.writeFile(workbook, `College_Students_Fee_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Download Sample Excel Template for Admin Upload
  const handleDownloadSampleExcel = () => {
    const titleRow = ["NETAJI SUBHASHCHANDRA BOSE EDUCATION TRUST'S NETAJI POLYTECHNIC COLLEGE"];
    const headerRow = ["SRNO", "ENROLMENTNO", "NAME", "SCHEME", "Year"];

    const sampleRows = [
      [1, '20240325001192', 'Sakshi Patil', 'Engineering', '3rd Year'],
      [2, '20240325001144', 'Rahul Deshmukh', 'Engineering', '3rd Year'],
      [3, '20240325001188', 'Anita Shinde', 'Polytechnic', '2nd Year']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([titleRow, [], headerRow, ...sampleRows]);
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Sample');
    XLSX.writeFile(workbook, 'Student_Data_Sample_Template.xlsx');
  };

  // Financial Stats calculation
  const totalCollected = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalStudents = students.length;
  
  const expectedPerStudent = (configForm.tuitionFee || 45000) + (configForm.examFee || 2500);
  const totalExpected = totalStudents * expectedPerStudent;
  const totalPending = Math.max(0, totalExpected - totalCollected);

  // Valid non-dummy students list
  const validStudentsList = students.filter(std => 
    std.fullName && 
    std.fullName !== 'Student' && 
    std.fullName.toLowerCase() !== 'student name' && 
    std.fullName.toLowerCase() !== 'candidate name' &&
    std.prnNo !== 'N/A'
  );

  const polytechnicStudents = validStudentsList.filter(s => {
    const c = (s.course || s.educationDetails?.course || 'Polytechnic').toLowerCase();
    return c.includes('poly') || (!c.includes('pharm') && !c.includes('eng'));
  });

  const pharmacyStudents = validStudentsList.filter(s => 
    (s.course || s.educationDetails?.course || '').toLowerCase().includes('pharm')
  );

  // Filter students (exclude dummy / invalid records)
  const filteredStudents = students.filter(std => {
    // Hide dummy/empty student records
    if (
      !std.fullName || 
      std.fullName === 'Student' || 
      std.fullName.toLowerCase() === 'student name' || 
      std.fullName.toLowerCase() === 'candidate name' ||
      std.prnNo === 'N/A'
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
      (activeCourseTab === 'Pharmacy' && stdCourse.includes('pharm'));

    const stdPayments = payments.filter(p => p.studentId === std.id || p.rollNo === std.rollNo);
    const hasPaidTuition = stdPayments.some(p => p.feeType === 'tuitionFee');
    const hasPaidExam = stdPayments.some(p => p.feeType === 'examFee');
    const isFullyPaid = hasPaidTuition && hasPaidExam;

    let matchesStatus = true;
    if (statusFilter === 'paid') matchesStatus = isFullyPaid;
    if (statusFilter === 'pending') matchesStatus = !isFullyPaid;

    return matchesSearch && matchesCourseTab && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* 🚀 FLOATING POPUP NOTIFICATION: Save Fee Successfully */}
      {isSavedAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 text-white border-2 border-emerald-400 shadow-2xl backdrop-blur-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 animate-bounce">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Fee Structure Saved Successfully! 🎉</p>
              <p className="text-[11px] text-emerald-300 font-semibold">New fee amounts have been updated for all students.</p>
            </div>
          </div>
        </div>
      )}



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

      {/* Main Grid: Fee Configurator + Excel Student Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 Cols): Fee Amount Configurator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-interactive p-5 sm:p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Set Fee Structure</h2>
                  <p className="text-xs text-slate-500 font-medium">Configure fee amounts for students</p>
                </div>
              </div>
            </div>

            {isSavedAlert && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Fee structure updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={configForm.academicYear}
                  onChange={(e) => setConfigForm({ ...configForm, academicYear: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* FEE OPTION 1: Exam Fee */}
              <div className="card-interactive bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Option 1: Exam Fee</span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-300/50">Exam</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fee Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={configForm.examFee ?? 2500}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setConfigForm({ ...configForm, examFee: val ? Number(val) : '' });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={configForm.examDueDate || '2026-08-25'}
                    onChange={(e) => setConfigForm({ ...configForm, examDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              {/* FEE OPTION 2: Tuition Fee */}
              <div className="card-interactive bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Option 2: Tuition Fee</span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-300/50">Tuition</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fee Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={configForm.tuitionFee ?? 45000}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setConfigForm({ ...configForm, tuitionFee: val ? Number(val) : '' });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={configForm.tuitionDueDate}
                    onChange={(e) => setConfigForm({ ...configForm, tuitionDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Save Fee Config</span>
              </button>

            </form>

          </div>
        </div>

        {/* Right Column (8 Cols): EXCEL STUDENT DATABASE & ADD / UPLOAD ACTIONS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="card-interactive p-5 sm:p-6">
            
            {/* Top Action Bar (Upload Excel Sheet + Add Student Manually) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Directory Excel Sheet</h3>
                <p className="text-xs text-slate-500 font-medium">Name, Enrolment No, Scheme & Year records</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                
                {/* 📄 Upload Excel Sheet Button */}
                <button
                  onClick={() => setIsExcelModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>Upload Excel Sheet</span>
                </button>

                {/* ➕ Add Student Manually Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                  <span>Add Student</span>
                </button>

                {/* 🗑️ Clear All Students Button */}
                {onClearAllStudents && students.length > 0 && (
                  <button
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

            {/* 🎓 Attractive Vibrant Course Filter Tabs (Polytechnic vs Pharmacy) */}
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

            {/* Excel Sheet Table Grid */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">SRNO</th>
                    <th className="py-3 px-3">ENROLMENTNO</th>
                    <th className="py-3 px-3">NAME</th>
                    <th className="py-3 px-3">SCHEME</th>
                    <th className="py-3 px-3">YEAR</th>
                    <th className="py-3 px-3">TUITION FEE</th>
                    <th className="py-3 px-3">EXAM FEE</th>
                    <th className="py-3 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-slate-400 font-medium bg-slate-50">
                        No student records found in database. Click "Upload Excel Sheet" or "Add Student".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std, idx) => {
                      const stdPayments = payments.filter(p => (std.id && p.studentId === std.id) || (std.rollNo && p.rollNo === std.rollNo) || (std.prnNo && p.prnNo === std.prnNo));
                      const totalTuitionPaidForStd = stdPayments
                        .filter(p => p.feeType === 'tuitionFee' && p.status === 'PAID')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);
                      const totalExamPaidForStd = stdPayments
                        .filter(p => p.feeType === 'examFee' && p.status === 'PAID')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);

                      const reqTuitionFee = feesConfig.tuitionFee || 45000;
                      const reqExamFee = feesConfig.examFee || 2500;

                      const isTuitionFullyPaid = totalTuitionPaidForStd >= reqTuitionFee && reqTuitionFee > 0;
                      const isExamFullyPaid = totalExamPaidForStd >= reqExamFee && reqExamFee > 0;

                      const tuitionPay = stdPayments.find(p => p.feeType === 'tuitionFee');
                      const examPay = stdPayments.find(p => p.feeType === 'examFee');

                      return (
                        <tr key={std.id ? `${std.id}_${idx}` : idx} className="hover:bg-slate-50/60 transition-colors">
                          
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
                            <p className="font-semibold text-slate-900">{std.fullName}</p>
                          </td>

                          {/* SCHEME (Course / Scheme Code) */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100/80">
                              {std.scheme || std.educationDetails?.scheme || std.course || std.educationDetails?.course || 'Polytechnic'}
                            </span>
                          </td>

                          {/* YEAR */}
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-700">
                              {std.year || std.educationDetails?.year || '2nd Year'}
                            </span>
                          </td>

                          {/* Tuition Fee */}
                          <td className="py-3 px-3">
                            {isTuitionFullyPaid ? (
                              <div className="flex flex-col items-start gap-1">
                                <button
                                  onClick={() => onViewInvoice(tuitionPay)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                                >
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> ₹{totalTuitionPaidForStd?.toLocaleString('en-IN')}
                                </button>
                                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {tuitionPay?.dateTime || tuitionPay?.date ? `${tuitionPay.date || ''} ${tuitionPay.time || ''}` : tuitionPay?.timestamp ? new Date(tuitionPay.timestamp).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Paid'}
                                </span>
                              </div>
                            ) : totalTuitionPaidForStd > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                                Paid ₹{totalTuitionPaidForStd?.toLocaleString('en-IN')} / ₹{reqTuitionFee?.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Exam Fee */}
                          <td className="py-3 px-3">
                            {isExamFullyPaid ? (
                              <div className="flex flex-col items-start gap-1">
                                <button
                                  onClick={() => onViewInvoice(examPay)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                                >
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> ₹{totalExamPaidForStd?.toLocaleString('en-IN')}
                                </button>
                                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {examPay?.dateTime || examPay?.date ? `${examPay.date || ''} ${examPay.time || ''}` : examPay?.timestamp ? new Date(examPay.timestamp).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Paid'}
                                </span>
                              </div>
                            ) : totalExamPaidForStd > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                                Paid ₹{totalExamPaidForStd?.toLocaleString('en-IN')} / ₹{reqExamFee?.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => onDeleteStudent(std.id)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 📥 Download Student Fee Excel Report Button Below Table */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-semibold text-slate-900">{filteredStudents.length}</span> student records
              </p>
              <button
                onClick={handleExportToExcel}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Export Excel Report (.xlsx)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

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

    </div>
  );
}
