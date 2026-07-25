import React from 'react';
import { X, Printer, CheckCircle, GraduationCap, Download, FileCheck } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden soft-shadow">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm tracking-wide uppercase text-slate-200">Official Payment Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-8 bg-white">
          
          {/* Institution Info Header */}
          <div className="text-center pb-6 border-b border-slate-200 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-3 border border-brand-100">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Government Engineering College</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Autonomous Institute of Maharashtra State</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Affiliated to University • ISO 9001:2015 Certified</p>
          </div>

          {/* Transaction Metadata Bar */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Receipt No</p>
              <p className="font-mono font-bold text-slate-800">{transaction.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Payment Date</p>
              <p className="font-bold text-slate-800">{new Date(transaction.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Razorpay Payment ID</p>
              <p className="font-mono font-bold text-emerald-700">{transaction.razorpayPaymentId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Status</p>
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> SUCCESSFUL
              </span>
            </div>
          </div>

          {/* Student Profile Details */}
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Student Name:</span>
                <p className="font-bold text-slate-900">{transaction.studentName || 'Sakshi Patil'}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Roll Number:</span>
                <p className="font-mono font-bold text-slate-800">{transaction.rollNo || 'CS2026-042'}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">PRN Number:</span>
                <p className="font-mono font-semibold text-slate-800">20240325001192</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Payment Method:</span>
                <p className="font-semibold text-slate-800">{transaction.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Fee Item Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/80 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fee Particulars</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{transaction.feeTitle}</p>
                    <p className="text-xs text-slate-500">Academic Year 2026-2027</p>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">₹{transaction.amount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 text-base">
                  <td className="py-3 px-4">Total Amount Paid</td>
                  <td className="py-3 px-4 text-right text-brand-600">₹{transaction.amount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Stamp / Authorization Note */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-dashed border-slate-200">
            <div>
              <p className="font-bold text-slate-700">Digital Verification</p>
              <p className="text-[11px]">Computer generated receipt. No signature required.</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 flex items-center justify-center p-1 font-bold text-[10px] text-emerald-700 rotate-[-12deg] bg-emerald-50/50">
                PAID & VERIFIED
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
