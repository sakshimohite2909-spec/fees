import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, CheckCircle, Users, UserCheck, Search, CheckSquare, Square, AlertCircle, Sparkles, BookOpen, Layers, CreditCard, FileText } from 'lucide-react';

export default function SetFeeStructureModal({ 
  isOpen, 
  onClose, 
  feesConfig, 
  onUpdateFeesConfig, 
  students = [], 
  initialSelectedStudentIds = [],
  onUpdateSelectedStudentsFees 
}) {
  // Scope mode: 'all' | 'semester' | 'selected'
  const [applyMode, setApplyMode] = useState('all'); 
  const [targetSemester, setTargetSemester] = useState('4th Semester');
  const [targetYear, setTargetYear] = useState('2nd Year');

  const [configForm, setConfigForm] = useState(feesConfig || {});
  const [selectedStudentIds, setSelectedStudentIds] = useState(initialSelectedStudentIds || []);
  const [studentSearch, setStudentSearch] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [saveBannerText, setSaveBannerText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Valid non-dummy students list
  const validStudents = (students || []).filter(std => 
    std.fullName && 
    std.fullName !== 'Student' && 
    std.fullName.toLowerCase() !== 'student name' && 
    std.fullName.toLowerCase() !== 'candidate name'
  );

  const searchedStudents = validStudents.filter(std => {
    const q = studentSearch.toLowerCase();
    return (
      (std.fullName && std.fullName.toLowerCase().includes(q)) ||
      (std.prnNo && std.prnNo.toLowerCase().includes(q)) ||
      (std.scheme && std.scheme.toLowerCase().includes(q)) ||
      (std.course && std.course.toLowerCase().includes(q))
    );
  });

  // Students matching semester filter
  const semesterMatchingStudents = validStudents.filter(std => {
    const stdSem = (std.semester || std.educationDetails?.semester || '').toLowerCase();
    const stdYr = (std.year || std.educationDetails?.year || '').toLowerCase();
    
    const semMatches = targetSemester === 'All' || stdSem.includes(targetSemester.toLowerCase());
    const yrMatches = targetYear === 'All' || stdYr.includes(targetYear.toLowerCase());

    return semMatches && yrMatches;
  });

  useEffect(() => {
    if (feesConfig) {
      setConfigForm(feesConfig);
    }
    if (initialSelectedStudentIds && initialSelectedStudentIds.length > 0) {
      setSelectedStudentIds(initialSelectedStudentIds);
      setApplyMode('selected');
    } else {
      setApplyMode('all');
    }
    setErrorMsg('');
  }, [feesConfig, initialSelectedStudentIds, isOpen]);

  if (!isOpen) return null;

  const toggleStudentSelection = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allIds = searchedStudents.map(s => s.id);
    const combined = Array.from(new Set([...selectedStudentIds, ...allIds]));
    setSelectedStudentIds(combined);
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (applyMode === 'selected' && selectedStudentIds.length === 0) {
      setErrorMsg('Please select at least 1 student from the list.');
      return;
    }

    if (applyMode === 'semester' && semesterMatchingStudents.length === 0) {
      setErrorMsg(`No students found in ${targetSemester} (${targetYear}).`);
      return;
    }

    const payload = {
      ...configForm,
      targetSemester: applyMode === 'semester' ? targetSemester : 'All',
      targetYear: applyMode === 'semester' ? targetYear : 'All'
    };

    if (applyMode === 'all') {
      if (onUpdateFeesConfig) {
        onUpdateFeesConfig(payload);
      }
      setSaveBannerText('Fee structure successfully applied to all college students!');
    } else if (applyMode === 'semester') {
      const matchingIds = semesterMatchingStudents.map(s => s.id);
      if (onUpdateSelectedStudentsFees) {
        onUpdateSelectedStudentsFees(matchingIds, payload);
      }
      setSaveBannerText(`Fee structure saved for ${matchingIds.length} student(s) in ${targetSemester}!`);
    } else {
      if (onUpdateSelectedStudentsFees) {
        onUpdateSelectedStudentsFees(selectedStudentIds, payload);
      }
      setSaveBannerText(`Custom fees applied to ${selectedStudentIds.length} selected student(s)!`);
    }

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative animate-scaleUp">
        
        {/* Modern Clean Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Fee Structure Setting</h2>
              <p className="text-xs text-slate-500 font-medium">Set fees by All Students, Semester, or Selected Student(s)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {isSavedSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveBannerText}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* STEP 1: Fee Target Scope Picker (Segmented Bar) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Target Audience / Scope
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Select who this fee applies to</span>
            </div>

            <div className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {/* Scope 1: All Students */}
              <button
                type="button"
                onClick={() => setApplyMode('all')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  applyMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>All College Students</span>
              </button>

              {/* Scope 2: Selected Student(s) */}
              <button
                type="button"
                onClick={() => setApplyMode('selected')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  applyMode === 'selected'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Selected Student(s)</span>
                {selectedStudentIds.length > 0 && (
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {selectedStudentIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {applyMode === 'selected' && (
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  Select Individual Students ({selectedStudentIds.length} Selected)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 rounded transition-all"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[10px] font-bold text-slate-600 bg-slate-200/80 hover:bg-slate-300 px-2 py-0.5 rounded transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student by Name or PRN..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-purple-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-xl border border-purple-100">
                {searchedStudents.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No matching students found.</p>
                ) : (
                  searchedStudents.map((std) => {
                    const isSelected = selectedStudentIds.includes(std.id);
                    return (
                      <div
                        key={std.id}
                        onClick={() => toggleStudentSelection(std.id)}
                        className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-all ${
                          isSelected ? 'bg-purple-100 text-purple-950 font-bold border border-purple-300' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-purple-700" /> : <Square className="w-4 h-4 text-slate-300" />}
                          <span className="truncate">{std.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({std.prnNo || 'N/A'})</span>
                        </div>
                        <span className="text-[10px] font-semibold text-purple-700">{std.semester || '4th Sem'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Academic Year & Semester Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={configForm.academicYear || '2026-2027'}
                onChange={(e) => setConfigForm({ ...configForm, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Semester</label>
              <select
                value={targetSemester}
                onChange={(e) => {
                  setTargetSemester(e.target.value);
                  setConfigForm({ ...configForm, semester: e.target.value });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Semesters</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>
          </div>

          {/* STEP 3: Fee Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CARD 1: TUITION FEE */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-900">Tuition Fee</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={configForm.tuitionFee ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setConfigForm({ ...configForm, tuitionFee: val ? Number(val) : '' });
                  }}
                  placeholder="20000"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={configForm.tuitionDueDate || ''}
                  onChange={(e) => setConfigForm({ ...configForm, tuitionDueDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* CARD 2: EXAM FEE */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-900">Exam Fee</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={configForm.examFee ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setConfigForm({ ...configForm, examFee: val ? Number(val) : '' });
                  }}
                  placeholder="40000"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={configForm.examDueDate || ''}
                  onChange={(e) => setConfigForm({ ...configForm, examDueDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-white" />
            <span>
              {applyMode === 'all' 
                ? 'Save & Apply Fee Structure (All Students)' 
                : `Save & Apply Custom Fees (${selectedStudentIds.length} Students)`}
            </span>
          </button>

        </form>

      </div>
    </div>
  );
}
