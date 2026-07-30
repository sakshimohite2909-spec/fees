import React, { useState } from 'react';
import { X, UserPlus, Phone, Hash, BookOpen, Mail, User, Save } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onAddStudent }) {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [prnNo, setPrnNo] = useState('');
  const [course, setCourse] = useState('Engineering');
  const [branch, setBranch] = useState('Computer Engineering');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const ENGINEERING_BRANCHES = [
    'Computer Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Electronics & Telecom',
    'Civil Engineering',
    'Artificial Intelligence (AI)'
  ];

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    if (newCourse === 'Engineering') {
      setBranch('Computer Engineering');
    } else {
      setBranch('N/A');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter Student Name');
      return;
    }
    if (!prnNo.trim()) {
      setError('Please enter PRN Number');
      return;
    }

    const studentData = {
      fullName: fullName.trim(),
      mobile: mobile.trim() || 'N/A',
      prnNo: prnNo.trim(),
      course,
      branch,
      rollNo: rollNo.trim() || `RN-${Math.floor(100 + Math.random() * 900)}`,
      email: email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`
    };

    onAddStudent(studentData);
    
    // Reset form
    setFullName('');
    setMobile('');
    setPrnNo('');
    setCourse('Engineering');
    setBranch('Computer Engineering');
    setRollNo('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden my-auto">

        {/* Top Header Banner */}
        <div className="bg-slate-50 p-5 text-slate-900 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Manually Add Student</h2>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Add student record directly into College Database</p>
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

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Sakshi Patil"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile & PRN Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PRN Number *</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="20240325001192"
                  value={prnNo}
                  onChange={(e) => setPrnNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-purple-700 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Select Academic Course & Select Branch */}
          <div className={`grid grid-cols-1 ${course === 'Engineering' ? 'sm:grid-cols-2' : ''} gap-3`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Academic Course *</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <select
                  value={course}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Engineering">Engineering (B.Tech / B.E.)</option>
                  <option value="Polytechnic">Polytechnic (Diploma)</option>
                  <option value="Pharmacy">Pharmacy (B.Pharm / D.Pharm)</option>
                </select>
              </div>
            </div>

            {course === 'Engineering' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Branch *</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  >
                    {ENGINEERING_BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Roll No & Gmail ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                placeholder="e.g. CS2026-042"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gmail ID / Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all shimmer-btn"
            >
              <Save className="w-4 h-4" />
              <span>Add Student to Database</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
