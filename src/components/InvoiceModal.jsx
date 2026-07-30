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
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          windowWidth: 800,
          scrollX: 0,
          scrollY: 0
        },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Light Header Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-wider uppercase text-white block">Official Fee E-Receipt</span>
              <span className="text-[11px] text-slate-300">Ref: {transaction.id || 'REC-2026-001'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Light Theme Receipt Area */}
        <div id="printable-receipt" className="p-4 sm:p-8 bg-white text-slate-900 print:p-0">
          
          {/* Institution Header */}
          <div className="border-b border-slate-200 pb-4 mb-4 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-4 text-center sm:text-left">
              
              {/* Emblem / Logo */}
              <div className="flex items-center gap-3 sm:gap-4 py-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center p-2.5 shadow-xs border border-indigo-700 shrink-0">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight uppercase">
                    Netaji Polytechnic College
                  </h1>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-0.5">
                    Dhule, Maharashtra • Approved by DTE & MSBTE
                  </p>
                </div>
              </div>

              {/* Receipt Title Badge */}
              <div className="text-center sm:text-right shrink-0 py-0.5">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold text-[10px] sm:text-xs rounded-lg uppercase tracking-wider border border-slate-200">
                  Official E-Receipt
                </span>
                <p className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-500 mt-1">
                  Academic Year 2026-27
                </p>
              </div>

            </div>
          </div>



          {/* Student & Transaction Information */}
          <div className="mb-4 sm:mb-6">
            
            {/* Student Info Box */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Student Profile Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] sm:text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 font-medium shrink-0">Student Name:</dt>
                  <dd className="font-bold text-slate-900 text-right truncate">{transaction.studentName || 'Sakshi Patil'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 font-medium shrink-0">Roll Number:</dt>
                  <dd className="font-mono font-bold text-indigo-600 text-right shrink-0">{transaction.rollNo || 'CS2026-042'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 font-medium shrink-0">PRN Number:</dt>
                  <dd className="font-mono font-bold text-slate-800 text-right shrink-0">{transaction.prnNo || '20240325001192'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 font-medium shrink-0">Department / Course:</dt>
                  <dd className="font-bold text-slate-900 text-right truncate">{transaction.branch || 'Computer Engineering'}</dd>
                </div>
              </dl>
            </div>

          </div>

          {/* Fee Itemization Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 sm:mb-5 w-full">
            <table className="w-full text-left text-xs table-auto">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[9px] sm:text-xs border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-2 sm:px-4 w-7 sm:w-12 text-center">Sr.</th>
                  <th className="py-2.5 px-2 sm:px-4">Fee Particulars & Description</th>
                  <th className="py-2.5 px-2 sm:px-4 text-center">Session</th>
                  <th className="py-2.5 px-2 sm:px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800 text-[11px] sm:text-xs">
                <tr className="bg-white">
                  <td className="py-3 px-2 sm:px-4 text-center font-bold text-indigo-600">01</td>
                  <td className="py-3 px-2 sm:px-4">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{transaction.feeTitle || 'Academic Tuition Fee'}</p>
                    <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 font-medium">Official Academic Course Fee & Department Charges</p>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-slate-700 font-semibold text-[10px] sm:text-xs whitespace-nowrap">2026-27</td>
                  <td className="py-3 px-2 sm:px-4 text-right font-bold text-slate-900 text-xs sm:text-base whitespace-nowrap">
                    ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                

                <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
                  <td colSpan="3" className="py-3 px-2 sm:px-4 text-right uppercase tracking-wider text-[10px] sm:text-xs text-slate-900">
                    Grand Total Paid
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-right text-emerald-700 font-bold text-sm sm:text-lg whitespace-nowrap">
                    ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 print:hidden">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-purple-700" />
                <span>Download PDF Receipt</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
