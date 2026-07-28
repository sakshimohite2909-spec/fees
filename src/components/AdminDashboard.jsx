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
  onDeleteStudent,
  onViewInvoice 
}) {
  const [configForm, setConfigForm] = useState(feesConfig);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onUpdateFeesConfig(configForm);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Export current student directory to Excel (.xlsx)
  const handleExportToExcel = () => {
    const exportData = students.map(std => {
      const stdPayments = payments.filter(p => p.studentId === std.id || p.rollNo === std.rollNo);
      const tuitionPay = stdPayments.find(p => p.feeType === 'tuitionFee');
      const examPay = stdPayments.find(p => p.feeType === 'examFee');

      return {
        'Student Name': std.fullName,
        'Mobile Number': std.mobile || std.educationDetails?.mobile || 'N/A',
        'PRN No': std.prnNo,
        'Branch': std.branch || std.educationDetails?.branch || 'Computer Engineering',
        'Roll No': std.rollNo,
        'Gmail ID': std.email,
        'Tuition Fee Status': tuitionPay ? `PAID (₹${tuitionPay.amount})` : 'PENDING',
        'Exam Fee Status': examPay ? `PAID (₹${examPay.amount})` : 'PENDING'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Database');
    XLSX.writeFile(workbook, `College_Students_Fee_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Download Sample Excel Template for Admin Upload
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        'Name': 'Sakshi Patil',
        'Mobile Number': '9876543210',
        'PRN No': '20240325001192',
        'Branch': 'Computer Engineering',
        'Roll No': 'CS2026-042',
        'Gmail ID': 'sakshpatil@gmail.com'
      },
      {
        'Name': 'Rahul Deshmukh',
        'Mobile Number': '9822114455',
        'PRN No': '20240325001144',
        'Branch': 'Information Technology',
        'Roll No': 'CS2026-015',
        'Gmail ID': 'rahul.deshmukh@gmail.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
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

  // Filter students
  const filteredStudents = students.filter(std => {
    const matchesSearch = 
      (std.fullName && std.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.rollNo && std.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.prnNo && std.prnNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.mobile && std.mobile.includes(searchQuery)) ||
      (std.branch && std.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (std.email && std.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const stdPayments = payments.filter(p => p.studentId === std.id || p.rollNo === std.rollNo);
    const hasPaidTuition = stdPayments.some(p => p.feeType === 'tuitionFee');
    const hasPaidExam = stdPayments.some(p => p.feeType === 'examFee');
    const isFullyPaid = hasPaidTuition && hasPaidExam;

    if (statusFilter === 'paid') return matchesSearch && isFullyPaid;
    if (statusFilter === 'pending') return matchesSearch && !isFullyPaid;
    return matchesSearch;
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
                <p className="text-xs text-slate-500 font-medium">Name, Mobile Number, PRN No & Branch records</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                
                {/* 📄 Upload Excel Sheet Button */}
                <button
                  onClick={() => setIsExcelModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>Upload Excel Sheet</span>
                </button>

                {/* ➕ Add Student Manually Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                  <span>Add Student</span>
                </button>

              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile, PRN No, Branch..."
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
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Mobile Number</th>
                    <th className="py-3 px-3">PRN No</th>
                    <th className="py-3 px-3">Branch / Dept</th>
                    <th className="py-3 px-3">Tuition Fee</th>
                    <th className="py-3 px-3">Exam Fee</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400 font-medium bg-slate-50">
                        No student records found in database. Click "Upload Excel Sheet" or "Add Student".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => {
                      const stdPayments = payments.filter(p => p.studentId === std.id || p.rollNo === std.rollNo);
                      const tuitionPay = stdPayments.find(p => p.feeType === 'tuitionFee');
                      const examPay = stdPayments.find(p => p.feeType === 'examFee');

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Student Name */}
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-900">{std.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{std.email}</p>
                          </td>

                          {/* Mobile Number */}
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-700 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {std.mobile || std.educationDetails?.mobile || 'N/A'}
                            </span>
                          </td>

                          {/* PRN No */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {std.prnNo || 'N/A'}
                            </span>
                          </td>

                          {/* Branch */}
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-700">
                              {std.branch || std.educationDetails?.branch || 'Computer Engineering'}
                            </span>
                          </td>

                          {/* Tuition Fee */}
                          <td className="py-3 px-3">
                            {tuitionPay ? (
                              <button
                                onClick={() => onViewInvoice(tuitionPay)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]"
                              >
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> ₹{tuitionPay.amount?.toLocaleString('en-IN')}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Exam Fee */}
                          <td className="py-3 px-3">
                            {examPay ? (
                              <button
                                onClick={() => onViewInvoice(examPay)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]"
                              >
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> ₹{examPay.amount?.toLocaleString('en-IN')}
                              </button>
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
