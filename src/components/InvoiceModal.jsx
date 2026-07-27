import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, GraduationCap, Download, FileCheck, ShieldCheck, QrCode, Building2, MapPin, Globe, PhoneCall, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Helper to format numbers into words (Indian currency format)
const numberToWords = (num) => {
  if (!num || isNaN(num)) return 'Rupees Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  };

  return `Rupees ${inWords(Number(num)).trim()} Only`;
};

export default function InvoiceModal({ isOpen, onClose, transaction }) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle browser BACK button while modal is open so it closes modal instead of exiting website
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ isReceiptModalOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    const studentName = (transaction?.studentName || 'Student').replace(/\s+/g, '_');
    const rollNo = transaction?.rollNo || 'Receipt';
    document.title = `Fee_Receipt_${rollNo}_${studentName}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    try {
      setIsDownloading(true);
      const studentName = (transaction?.studentName || 'Student').replace(/\s+/g, '_');
      const rollNo = transaction?.rollNo || 'Receipt';
      const filename = `Fee_Receipt_${rollNo}_${studentName}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Direct PDF export error, triggering print fallback:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = new Date(transaction.timestamp || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = new Date(transaction.timestamp || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 max-w-2xl w-full overflow-hidden soft-shadow my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Light Header Bar (Hidden when printing) */}
        <div className="bg-gradient-to-r from-purple-50 via-pink-50/50 to-purple-50 text-purple-950 px-6 py-4 flex items-center justify-between border-b border-purple-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-black text-xs tracking-wider uppercase text-purple-950 block">Official Fee E-Receipt</span>
              <span className="text-[11px] font-bold text-purple-700">Ref: {transaction.id || 'REC-2026-001'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-700 hover:text-purple-950 bg-white hover:bg-purple-100 p-2 rounded-full transition-all border border-purple-200 shadow-sm"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Light Theme Receipt Area */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white text-slate-800 print:p-0">
          
          {/* Institution Letterhead Header */}
          <div className="border-b-2 border-purple-600 pb-5 mb-5 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
              
              {/* Emblem / Logo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 text-white flex items-center justify-center p-3 shadow-md shadow-purple-500/20 border-2 border-purple-200 shrink-0">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-purple-950 tracking-tight uppercase leading-none">
                    Government Engineering College
                  </h1>
                  <p className="text-xs font-black text-purple-800 mt-1 tracking-wide">
                    Autonomous Institute of Government of Maharashtra
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-2">
                    <span>Approved by AICTE</span> • <span>Affiliated to DBATU</span> • <span>ISO 9001:2015</span>
                  </p>
                </div>
              </div>

              {/* Receipt Title Badge */}
              <div className="text-center sm:text-right shrink-0">
                <span className="inline-block px-3.5 py-1 bg-purple-100 text-purple-950 font-black text-xs rounded-lg uppercase tracking-wider border border-purple-300 shadow-sm">
                  Official E-Receipt
                </span>
                <p className="text-[11px] font-mono font-bold text-purple-700 mt-1.5">
                  Academic Year 2026-27
                </p>
              </div>

            </div>
          </div>

          {/* Key Reference Bar (Light Theme) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 mb-6 text-xs">
            <div>
              <p className="text-purple-900 font-bold uppercase tracking-wider text-[9px]">Receipt No.</p>
              <p className="font-mono font-extrabold text-purple-950 truncate">{transaction.id || 'REC-2026-78507'}</p>
            </div>
            <div>
              <p className="text-purple-900 font-bold uppercase tracking-wider text-[9px]">Date & Time</p>
              <p className="font-bold text-slate-800">{formattedDate}, {formattedTime}</p>
            </div>
            <div>
              <p className="text-purple-900 font-bold uppercase tracking-wider text-[9px]">Payment Method</p>
              <p className="font-bold text-purple-900 truncate">{transaction.paymentMethod || 'Razorpay UPI'}</p>
            </div>
            <div>
              <p className="text-purple-900 font-bold uppercase tracking-wider text-[9px]">Status</p>
              <span className="inline-flex items-center gap-1 font-black text-emerald-700 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> PAID
              </span>
            </div>
          </div>

          {/* Student & Transaction Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            
            {/* Student Info Box */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-purple-950 mb-2.5 pb-1 border-b border-purple-200/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600" /> Student Profile Details
              </h3>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Student Name:</dt>
                  <dd className="font-black text-slate-900 text-right">{transaction.studentName || 'Sakshi Patil'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Roll Number:</dt>
                  <dd className="font-mono font-extrabold text-purple-700 text-right">{transaction.rollNo || 'CS2026-042'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">PRN Number:</dt>
                  <dd className="font-mono font-bold text-slate-800 text-right">{transaction.prnNo || '20240325001192'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Department:</dt>
                  <dd className="font-bold text-purple-900 text-right">{transaction.branch || 'Computer Engineering'}</dd>
                </div>
              </dl>
            </div>

            {/* Gateway Info Box */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Digital Payment Metadata
              </h3>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Razorpay Ref ID:</dt>
                  <dd className="font-mono font-extrabold text-emerald-700 text-right truncate max-w-[150px]" title={transaction.razorpayPaymentId}>
                    {transaction.razorpayPaymentId || 'pay_rzp_17850787'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Gateway Status:</dt>
                  <dd className="font-bold text-emerald-600 text-right">Captured & Verified</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Fee Category:</dt>
                  <dd className="font-bold text-slate-800 text-right">{transaction.feeType === 'tuitionFee' ? 'Tuition Dues' : 'Institutional Dues'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 font-semibold">Currency:</dt>
                  <dd className="font-bold text-slate-800 text-right">INR (₹)</dd>
                </div>
              </dl>
            </div>

          </div>

          {/* Fee Itemization Table (Light Theme) */}
          <div className="border-2 border-purple-300 rounded-2xl overflow-hidden mb-5 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-purple-700 via-violet-700 to-pink-600 text-white font-black uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Sr.</th>
                  <th className="py-3 px-4">Fee Particulars & Description</th>
                  <th className="py-3 px-4 text-center">Session</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 font-semibold text-slate-800">
                <tr className="bg-white">
                  <td className="py-3.5 px-4 text-center font-black text-purple-600">01</td>
                  <td className="py-3.5 px-4">
                    <p className="font-black text-purple-950 text-sm">{transaction.feeTitle || 'Academic Tuition Fee'}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Official B.Tech Academic Course Fee & Department Charges</p>
                  </td>
                  <td className="py-3.5 px-4 text-center text-purple-900 font-bold">2026-27</td>
                  <td className="py-3.5 px-4 text-right font-black text-purple-950 text-base">
                    ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                
                {/* Summary Rows (Light Theme) */}
                <tr className="bg-purple-50/60 font-bold border-t-2 border-purple-200">
                  <td colSpan="3" className="py-3 px-4 text-right text-purple-900 uppercase text-[10px] tracking-wider">
                    Sub-Total Amount
                  </td>
                  <td className="py-3 px-4 text-right text-purple-950 font-black text-sm">
                    ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white font-extrabold">
                  <td colSpan="3" className="py-3.5 px-4 text-right uppercase tracking-wider text-xs text-amber-300">
                    Grand Total Paid
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-300 font-black text-lg">
                    ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in Words Box (Light Theme) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs shadow-xs">
            <span className="text-amber-900 font-black uppercase tracking-wider text-[10px] block mb-0.5">Amount in Words:</span>
            <p className="font-black text-amber-950 italic text-sm">
              "{numberToWords(transaction.amount)}"
            </p>
          </div>

          {/* Digital Verification & Stamp Footer */}
          <div className="pt-4 border-t-2 border-purple-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* QR Code / Digital Verification */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-900 rounded-xl border border-purple-200 shadow-sm shrink-0">
                <QrCode className="w-9 h-9 text-purple-700" />
              </div>
              <div className="text-[10px] text-slate-600">
                <p className="font-black text-purple-950">Scan to Verify</p>
                <p className="leading-tight mt-0.5 font-medium">Encrypted verification code for portal authenticity check.</p>
              </div>
            </div>

            {/* Terms & Notice */}
            <div className="text-[10px] text-slate-500 font-medium space-y-0.5 text-center sm:text-left">
              <p className="font-black text-slate-800">Notice & Disclaimer:</p>
              <p className="leading-tight">• Computer generated receipt under IT Act 2000.</p>
              <p className="leading-tight">• Valid for official scholarship & tax submission.</p>
            </div>

            {/* Official Stamp Box */}
            <div className="flex justify-center sm:justify-end">
              <div className="relative w-28 h-28 rounded-full border-4 border-emerald-600/70 flex flex-col items-center justify-center p-2 text-center rotate-[-8deg] bg-emerald-50/40 shadow-inner group">
                <div className="w-full h-full rounded-full border border-dashed border-emerald-600/60 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-black tracking-widest text-emerald-800 uppercase">ACCOUNTS DEPT</span>
                  <CheckCircle className="w-5 h-5 text-emerald-600 my-0.5" />
                  <span className="text-[10px] font-black text-emerald-700 tracking-wider">PAID</span>
                  <span className="text-[8px] font-bold text-emerald-800">{formattedDate}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Contact Info */}
          <div className="mt-6 pt-3 border-t border-purple-100 text-center text-[10px] text-slate-500 font-semibold flex flex-wrap items-center justify-between gap-2">
            <span>Government Engineering College, Main Campus, Vidyanagar</span>
            <span>Email: accounts@gce.ac.in | Helpline: +91 02164 271711</span>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-purple-100 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-sm"
          >
            Close
          </button>

          {/* Download PDF Button (Light Theme Gradient) */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-black text-sm shadow-md shadow-purple-600/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF Receipt</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
