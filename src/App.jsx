import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import RazorpayModal from './components/RazorpayModal';
import InvoiceModal from './components/InvoiceModal';
import { 
  getFeesConfig, saveFeesConfig, 
  getStudents, saveStudent, saveMultipleStudents, deleteStudent,
  getPayments, recordPayment, 
  getCurrentUser, setCurrentUser 
} from './utils/storage';

export default function App() {
  const [activeRole, setActiveRole] = useState('student'); // 'student' | 'admin'
  const [currentUser, setLocalCurrentUser] = useState(null);
  
  // Data state
  const [feesConfig, setFeesConfig] = useState(getFeesConfig());
  const [students, setStudents] = useState(getStudents());
  const [payments, setPayments] = useState(getPayments());

  // Modal controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  
  const [activePaymentRequest, setActivePaymentRequest] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setLocalCurrentUser(user);
      if (user.role) setActiveRole(user.role);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setLocalCurrentUser(user);
    setCurrentUser(user);
    if (user.role) setActiveRole(user.role);
  };

  const handleLogout = () => {
    setLocalCurrentUser(null);
    setCurrentUser(null);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleSwitchRole = (role) => {
    setActiveRole(role);
  };

  const handleSaveStudent = (studentData) => {
    const updatedList = saveStudent(studentData);
    setStudents(updatedList);
    setLocalCurrentUser(studentData);
    setCurrentUser(studentData);
  };

  const handleImportStudents = (studentsList) => {
    const updatedList = saveMultipleStudents(studentsList);
    setStudents(updatedList);
  };

  const handleDeleteStudent = (studentId) => {
    const updatedList = deleteStudent(studentId);
    setStudents(updatedList);
  };

  const handleUpdateFeesConfig = (newConfig) => {
    const updated = saveFeesConfig(newConfig);
    setFeesConfig(updated);
  };

  const handleInitiatePayment = (feeDetails) => {
    const activeUser = currentUser || {
      id: `std_${Date.now()}`,
      fullName: 'Sakshi Patil',
      email: 'sakshi@gmail.com',
      rollNo: 'CS2026-042'
    };

    const studentProfile = students.find(s => s.email === activeUser.email) || students[0] || {
      id: activeUser.id || `std_${Date.now()}`,
      fullName: activeUser.fullName || 'Student',
      rollNo: activeUser.rollNo || 'CS2026-042'
    };

    setActivePaymentRequest({
      ...feeDetails,
      studentId: studentProfile.id || `std_${Date.now()}`,
      studentName: studentProfile.fullName || activeUser.fullName || 'Student',
      rollNo: studentProfile.rollNo || 'CS2026-042'
    });
  };

  const handlePaymentSuccess = (paymentResult) => {
    if (!activePaymentRequest) return;

    const newPaymentRecord = recordPayment({
      razorpayPaymentId: paymentResult.razorpayPaymentId,
      studentId: activePaymentRequest.studentId,
      studentName: activePaymentRequest.studentName,
      rollNo: activePaymentRequest.rollNo,
      feeType: activePaymentRequest.feeType,
      feeTitle: activePaymentRequest.feeTitle,
      amount: activePaymentRequest.amount,
      paymentMethod: paymentResult.paymentMethod
    });

    setPayments(getPayments());
    setActivePaymentRequest(null);
    // Show invoice directly after payment
    setActiveInvoice(newPaymentRecord);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onSwitchRole={handleSwitchRole}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeRole === 'student' ? (
          <StudentDashboard
            currentUser={currentUser}
            feesConfig={feesConfig}
            students={students}
            payments={payments}
            onSaveStudent={handleSaveStudent}
            onInitiatePayment={handleInitiatePayment}
            onViewInvoice={(trx) => setActiveInvoice(trx)}
            onOpenAuth={handleOpenAuth}
          />
        ) : (
          <AdminDashboard
            feesConfig={feesConfig}
            students={students}
            payments={payments}
            onUpdateFeesConfig={handleUpdateFeesConfig}
            onAddStudent={handleSaveStudent}
            onImportStudents={handleImportStudents}
            onDeleteStudent={handleDeleteStudent}
            onViewInvoice={(trx) => setActiveInvoice(trx)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          <p>© 2026 EduPay College Fee Management System. Integrated with Razorpay Payment Gateway & Excel Import.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Razorpay Payment Modal */}
      <RazorpayModal
        isOpen={!!activePaymentRequest}
        onClose={() => setActivePaymentRequest(null)}
        paymentDetails={activePaymentRequest}
        onSuccess={handlePaymentSuccess}
      />

      {/* Printable Receipt Invoice Modal */}
      <InvoiceModal
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        transaction={activeInvoice}
      />

    </div>
  );
}
