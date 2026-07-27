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
      const collegePay = stdPayments.find(p => p.feeType === 'collegeFee');

      return {
        'Student Name': std.fullName,
        'Mobile Number': std.mobile || std.educationDetails?.mobile || 'N/A',
        'PRN No': std.prnNo,
        'Branch': std.branch || std.educationDetails?.branch || 'Computer Engineering',
        'Roll No': std.rollNo,
        'Gmail ID': std.email,
        'Tuition Fee Status': tuitionPay ? `PAID (₹${tuitionPay.amount})` : 'PENDING',
        'College Fee Status': collegePay ? `PAID (₹${collegePay.amount})` : 'PENDING'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Database');
    XLSX.writeFile(workbook, `College_Students_Fee_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Financial Stats calculation
  const totalCollected = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalStudents = students.length;
  
  const expectedPerStudent = configForm.tuitionFee + configForm.collegeFee;
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
    const hasPaidCollege = stdPayments.some(p => p.feeType === 'collegeFee');
    const isFullyPaid = hasPaidTuition && hasPaidCollege;

    if (statusFilter === 'paid') return matchesSearch && isFullyPaid;
    if (statusFilter === 'pending') return matchesSearch && !isFullyPaid;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Admin Top Header Banner (Light Pastel Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100/90 via-pink-50/80 to-purple-100/90 text-slate-900 p-8 border-2 border-purple-200/90 shadow-sm animate-fadeIn">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-purple-900 border border-purple-200 text-xs font-black uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Fee Control & Excel Student Database
            </h1>
          </div>

          <div className="bg-white/90 p-5 rounded-2xl border border-purple-200 text-right shadow-sm">
            <p className="text-xs text-purple-900 font-extrabold uppercase tracking-wider">Total Fee Collection</p>
            <p className="text-3xl font-black text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 shadow-sm flex items-center gap-4 card-attractive-hover">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Collected Revenue</p>
            <p className="text-2xl font-black text-slate-900">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 shadow-sm flex items-center gap-4 card-attractive-hover">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Dues</p>
            <p className="text-2xl font-black text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 shadow-sm flex items-center gap-4 card-attractive-hover">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-inner">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Registered Students</p>
            <p className="text-2xl font-black text-slate-900">{totalStudents} Total</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 shadow-sm flex items-center gap-4 card-attractive-hover">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold shadow-inner">
            <CheckCircle className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Razorpay Transactions</p>
            <p className="text-2xl font-black text-slate-900">{payments.length} Paid</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Fee Configurator + Excel Student Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (4 Cols): Fee Amount Configurator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm glass-panel-glow card-attractive-hover">
            
            <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Set Fee Structure</h2>
                  <p className="text-xs text-slate-500 font-medium">Configure fee amounts for students</p>
                </div>
              </div>
            </div>

            {isSavedAlert && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Fee structure updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={configForm.academicYear}
                  onChange={(e) => setConfigForm({ ...configForm, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* FEE OPTION 1: Exam Fee */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Option 1: Exam Fee</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded">Exam</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={configForm.examFee ?? 2500}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setConfigForm({ ...configForm, examFee: val ? Number(val) : '' });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={configForm.examDueDate || '2026-08-25'}
                    onChange={(e) => setConfigForm({ ...configForm, examDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* FEE OPTION 2: Tuition Fee */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900">Option 2: Tuition Fee</span>
                  <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">Tuition</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={configForm.tuitionFee ?? 45000}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setConfigForm({ ...configForm, tuitionFee: val ? Number(val) : '' });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={configForm.tuitionDueDate}
                    onChange={(e) => setConfigForm({ ...configForm, tuitionDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* FEE OPTION 3: College Fee */}
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-pink-900">Option 3: College Fee</span>
                  <span className="text-[10px] bg-pink-200 text-pink-900 font-bold px-2 py-0.5 rounded">College</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={configForm.collegeFee ?? 12000}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setConfigForm({ ...configForm, collegeFee: val ? Number(val) : '' });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={configForm.collegeDueDate}
                    onChange={(e) => setConfigForm({ ...configForm, collegeDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 hover:from-purple-200 hover:to-pink-200 text-purple-950 font-black text-xs border-2 border-purple-300 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-purple-700" />
                <span>Save Fee Config</span>
              </button>

            </form>

          </div>
        </div>

        {/* Right Column (8 Cols): EXCEL STUDENT DATABASE & ADD / UPLOAD ACTIONS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm glass-panel-glow card-attractive-hover">
            
            {/* Top Action Bar (Upload Excel Sheet + Add Student Manually) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Student Directory Excel Sheet</h3>
                <p className="text-xs text-slate-500 font-medium">Name, Mobile Number, PRN No & Branch records</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                
                {/* 📤 Upload Excel Button */}
                <button
                  onClick={() => setIsExcelModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 font-extrabold text-xs border border-purple-300 shadow-sm transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-700" />
                  <span>Upload Excel Sheet</span>
                </button>

                {/* ➕ Add Student Manually Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 hover:from-purple-200 hover:to-pink-200 text-purple-950 font-extrabold text-xs border-2 border-purple-300 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-purple-700" />
                  <span>Add Student</span>
                </button>

                {/* 📥 Export to Excel */}
                <button
                  onClick={handleExportToExcel}
                  title="Export Current Table to Excel"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200"
                >
                  <Download className="w-4 h-4" />
                </button>

              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile, PRN No, Branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-semibold bg-white w-full sm:w-auto"
              >
                <option value="all">All Fee Status</option>
                <option value="paid">Fully Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Excel Sheet Table Grid (Displaying Name, Mobile, PRN, Branch) */}
            <div className="overflow-x-auto border border-purple-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-purple-100 to-pink-50 text-purple-950 font-black uppercase border-b border-purple-200">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Mobile Number</th>
                    <th className="py-3 px-3">PRN No</th>
                    <th className="py-3 px-3">Branch / Dept</th>
                    <th className="py-3 px-3">Tuition Fee</th>
                    <th className="py-3 px-3">College Fee</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400 font-semibold bg-purple-50/20">
                        No student records found in database. Click "Upload Excel Sheet" or "Add Student".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => {
                      const stdPayments = payments.filter(p => p.studentId === std.id || p.rollNo === std.rollNo);
                      const tuitionPay = stdPayments.find(p => p.feeType === 'tuitionFee');
                      const collegePay = stdPayments.find(p => p.feeType === 'collegeFee');

                      return (
                        <tr key={std.id} className="hover:bg-purple-50/50 transition-colors">
                          
                          {/* Student Name */}
                          <td className="py-3 px-3">
                            <p className="font-extrabold text-slate-900">{std.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{std.email}</p>
                          </td>

                          {/* Mobile Number */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-purple-500" />
                              {std.mobile || std.educationDetails?.mobile || 'N/A'}
                            </span>
                          </td>

                          {/* PRN No */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {std.prnNo || 'N/A'}
                            </span>
                          </td>

                          {/* Branch */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-purple-100">
                              {std.branch || std.educationDetails?.branch || 'Computer Engineering'}
                            </span>
                          </td>

                          {/* Tuition Fee */}
                          <td className="py-3 px-3">
                            {tuitionPay ? (
                              <button
                                onClick={() => onViewInvoice(tuitionPay)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                              >
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> ₹{tuitionPay.amount?.toLocaleString('en-IN')}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* College Fee */}
                          <td className="py-3 px-3">
                            {collegePay ? (
                              <button
                                onClick={() => onViewInvoice(collegePay)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                              >
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> ₹{collegePay.amount?.toLocaleString('en-IN')}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
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
