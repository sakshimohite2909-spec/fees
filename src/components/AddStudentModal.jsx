import React, { useState } from 'react';
import { X, UserPlus, Hash, BookOpen, User, Save, Layers, GraduationCap } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onAddStudent }) {
  const [fullName, setFullName] = useState('');
  const [prnNo, setPrnNo] = useState('');
  const [scheme, setScheme] = useState('CE-K');
  const [year, setYear] = useState('2nd Year');
  const [semester, setSemester] = useState('4th Semester');
  const [error, setError] = useState('');

  const SCHEME_OPTIONS = [
    'CE-K',
    'ME-K',
    'EE-K',
    'CO-K',
    'EJ-K',
    'CIVIL-K',
    'PH-2-J',
    'Engineering',
    'Polytechnic',
    'Pharmacy'
  ];

  const YEAR_OPTIONS = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year'
  ];

  const SEMESTER_OPTIONS = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester'
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!prnNo.trim()) {
      setError('Please enter ENROLMENTNO');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter NAME');
      return;
    }

    const studentData = {
      fullName: fullName.trim(),
      mobile: 'N/A',
      prnNo: prnNo.trim(),
      scheme: scheme.trim() || 'Polytechnic',
      year: year,
      semester: semester,
      course: scheme.trim() || 'Polytechnic',
      branch: 'N/A',
      rollNo: `RN-${Math.floor(100 + Math.random() * 900)}`,
      email: `${fullName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      educationDetails: {
        course: scheme.trim() || 'Polytechnic',
        scheme: scheme.trim() || 'Polytechnic',
        year,
        semester,
        branch: 'N/A',
        mobile: 'N/A',
        collegeName: 'Netaji Polytechnic / Pharmacy College'
      }
    };

    onAddStudent(studentData);
    
    // Reset form
    setFullName('');
    setPrnNo('');
    setScheme('CE-K');
    setYear('2nd Year');
    setSemester('4th Semester');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden my-auto">

        {/* Top Header Banner */}
        <div className="bg-slate-50 p-5 text-slate-900 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Add Student Record</h2>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Add student directly into College Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors border border-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Headline Fields: ENROLMENTNO & NAME */}
          <div className="space-y-4">
            {/* ENROLMENTNO */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                <span>ENROLMENTNO *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 20240325001192"
                value={prnNo}
                onChange={(e) => setPrnNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-indigo-700 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* NAME */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>NAME *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sakshi Patil"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* SCHEME */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>SCHEME *</span>
              </label>
              <input
                type="text"
                required
                list="scheme-suggestions"
                placeholder="e.g. CE-K"
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
              <datalist id="scheme-suggestions">
                {SCHEME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>

            {/* YEAR & SEMESTER */}
            <div className="grid grid-cols-2 gap-3">
              {/* YEAR */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>YEAR *</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* SEMESTER */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>SEMESTER *</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  {SEMESTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Add Student Record</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
