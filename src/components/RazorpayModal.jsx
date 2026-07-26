import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle, Smartphone, Building, Lock } from 'lucide-react';

export default function RazorpayModal({ isOpen, onClose, paymentDetails, onSuccess }) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('student@okicici');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !paymentDetails) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    
    // Simulate Razorpay Gateway Processing Delay
    setTimeout(() => {
      setIsProcessing(false);
      const razorpayPaymentId = `pay_rzp_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      onSuccess({
        razorpayPaymentId,
        paymentMethod: method === 'upi' ? `Razorpay UPI (${upiId})` : 'Razorpay Card/NetBanking'
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden soft-shadow my-auto">

        
        {/* Razorpay Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-black text-xl text-blue-400">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">Razorpay</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                  TEST MODE
                </span>
              </div>
              <p className="text-xs text-blue-200">Government College Fee Collection Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Paying for Fee</p>
            <p className="text-sm font-bold text-slate-900">{paymentDetails.feeTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500">Total Amount</p>
            <p className="text-2xl font-black text-brand-600">₹{paymentDetails.amount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Payment Method</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setMethod('upi')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                method === 'upi'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-5 h-5 mx-auto mb-1 text-brand-600" />
              <span className="text-xs">UPI / GPay</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                method === 'card'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
              <span className="text-xs">Debit/Credit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('netbanking')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                method === 'netbanking'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <span className="text-xs">NetBanking</span>
            </button>
          </div>

          {/* Form details based on method */}
          {method === 'upi' && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Enter VPA / UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="mobile@upi"
              />
              <div className="flex gap-2 text-[11px] text-slate-500 font-medium">
                <span className="bg-white border px-2 py-0.5 rounded">GPay</span>
                <span className="bg-white border px-2 py-0.5 rounded">PhonePe</span>
                <span className="bg-white border px-2 py-0.5 rounded">Paytm</span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  defaultValue="4532 •••• •••• 8812"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry</label>
                  <input type="text" defaultValue="08/28" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                  <input type="password" defaultValue="•••" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono" />
                </div>
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Bank</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
                <option>State Bank of India (SBI)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* Security Assurance */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-6 px-1">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-bit Bank Grade SSL Security
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-mono">
              <Lock className="w-3 h-3" /> Razorpay Verified
            </span>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePayNow}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing Payment via Razorpay...
              </span>
            ) : (
              <span>Pay ₹{paymentDetails.amount.toLocaleString('en-IN')} Now</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
