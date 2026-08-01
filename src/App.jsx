import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import RazorpayModal from './components/RazorpayModal';
import InvoiceModal from './components/InvoiceModal';
import { 
  getFeesConfig, saveFeesConfig, 
  getStudents, saveStudent, saveMultipleStudents, clearAllStudents, deleteStudent,
  getPayments, recordPayment, clearAllPayments, deletePayment,
  getCurrentUser, setCurrentUser 
} from './utils/storage';
import './utils/firebase';
import { fetchStudentsFromFirestore, fetchPaymentsFromFirestore, syncStudentsToFirestore } from './utils/firebase';

export default function App() {
  // Check URL pathname for /admin
  const checkIsAdminPath = () => {
    const path = window.location.pathname.toLowerCase();
    return path === '/admin' || path.startsWith('/admin');
  };

  const [activeRole, setActiveRole] = useState(() => {
    if (checkIsAdminPath()) return 'admin';
    const user = getCurrentUser();
    return user?.role || 'student';
  });

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
    }

    // Auto-sync existing local student database to Firebase Firestore if present
    const localStudents = getStudents();
    if (localStudents && localStudents.length > 0) {
      syncStudentsToFirestore(localStudents);
    }

    // Fetch latest Firestore database records if available
    const loadFirebaseDatabase = async () => {
      const dbStudents = await fetchStudentsFromFirestore();
      if (dbStudents && dbStudents.length > 0) {
        setStudents(dbStudents);
        localStorage.setItem('edupay_students', JSON.stringify(dbStudents));
      }
      const dbPayments = await fetchPaymentsFromFirestore();
      if (dbPayments && dbPayments.length > 0) {
        setPayments(dbPayments);
        localStorage.setItem('edupay_payments', JSON.stringify(dbPayments));
      }
    };
    loadFirebaseDatabase();

    const syncRoleFromPath = () => {
      if (checkIsAdminPath()) {
        setActiveRole('admin');
      } else {
        const u = getCurrentUser();
        setActiveRole(u?.role || 'student');
      }
    };

    // Initial check
    syncRoleFromPath();

    // Listen for back/forward navigation
    window.addEventListener('popstate', syncRoleFromPath);
    return () => {
      window.removeEventListener('popstate', syncRoleFromPath);
    };
  }, []);

  const handleAuthSuccess = (user) => {
    setLocalCurrentUser(user);
    setCurrentUser(user);
    if (user.role) {
      handleSwitchRole(user.role);
    }
  };

  const handleLogout = () => {
    setLocalCurrentUser(null);
    setCurrentUser(null);
    setCurrentStep('mobile');
    if (checkIsAdminPath()) {
      window.history.pushState(null, '', '/');
      setActiveRole('student');
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleSwitchRole = (role) => {
    setActiveRole(role);
    if (role === 'admin') {
      if (!checkIsAdminPath()) {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (checkIsAdminPath()) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const handleSaveStudent = (studentData, isSelfRegistration = false) => {
    const updatedList = saveStudent(studentData);
    setStudents([...updatedList]);
    if (isSelfRegistration || activeRole !== 'admin') {
      setLocalCurrentUser(studentData);
      setCurrentUser(studentData);
    }
  };

  const handleImportStudents = (studentsList) => {
    const updatedList = saveMultipleStudents(studentsList, true);
    setStudents(updatedList);
  };

  const handleClearAllStudents = () => {
    const updatedList = clearAllStudents();
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

  const handleUpdateSelectedStudentsFees = (studentIds, customFeeData) => {
    if (!studentIds || studentIds.length === 0) return;
    const updatedList = students.map(std => {
      if (studentIds.includes(std.id) || (std.prnNo && studentIds.includes(std.prnNo))) {
        return {
          ...std,
          customFees: {
            academicYear: customFeeData.academicYear || '2026-2027',
            examFee: customFeeData.examFee !== undefined && customFeeData.examFee !== '' ? Number(customFeeData.examFee) : (std.customFees?.examFee ?? feesConfig?.examFee ?? 40000),
            examDueDate: customFeeData.examDueDate || std.customFees?.examDueDate || feesConfig?.examDueDate || '2026-07-29',
            tuitionFee: customFeeData.tuitionFee !== undefined && customFeeData.tuitionFee !== '' ? Number(customFeeData.tuitionFee) : (std.customFees?.tuitionFee ?? feesConfig?.tuitionFee ?? 20000),
            tuitionDueDate: customFeeData.tuitionDueDate || std.customFees?.tuitionDueDate || feesConfig?.tuitionDueDate || '2026-10-15',
            backlogFee: customFeeData.backlogFee !== undefined && customFeeData.backlogFee !== '' ? Number(customFeeData.backlogFee) : (std.customFees?.backlogFee ?? feesConfig?.backlogFee ?? 0),
            backlogDueDate: customFeeData.backlogDueDate || std.customFees?.backlogDueDate || feesConfig?.backlogDueDate || '2026-09-15',
            updatedAt: new Date().toISOString()
          }
        };
      }
      return std;
    });
    setStudents(updatedList);
    localStorage.setItem('edupay_students', JSON.stringify(updatedList));
    syncStudentsToFirestore(updatedList);

    // Sync logged in currentUser if applicable
    const u = getCurrentUser();
    if (u) {
      const targetStd = updatedList.find(s => s.id === u.id || (u.prnNo && s.prnNo === u.prnNo));
      if (targetStd) {
        setCurrentUser(targetStd);
        saveCurrentUser(targetStd);
      }
    }
  };

  const handleClearAllPayments = () => {
    const updatedList = clearAllPayments();
    setPayments(updatedList);
  };

  const handleDeletePayment = (paymentId) => {
    const updatedList = deletePayment(paymentId);
    setPayments(updatedList);
  };

  const handleInitiatePayment = (feeDetails) => {
    setActivePaymentRequest({
      feeType: feeDetails.feeType,
      feeTitle: feeDetails.feeTitle,
      amount: feeDetails.amount,
      studentId: feeDetails.studentId || currentUser?.id || `std_${Date.now()}`,
      studentName: feeDetails.studentName || currentUser?.fullName || 'Student',
      rollNo: feeDetails.rollNo || currentUser?.rollNo || 'N/A',
      prnNo: feeDetails.prnNo || currentUser?.prnNo || 'N/A',
      email: feeDetails.email || currentUser?.email || ''
    });
  };

  const handlePaymentSuccess = (paymentResult) => {
    if (!activePaymentRequest) return;

    const newPaymentRecord = recordPayment({
      razorpayPaymentId: paymentResult.razorpayPaymentId,
      studentId: activePaymentRequest.studentId,
      studentName: activePaymentRequest.studentName,
      rollNo: activePaymentRequest.rollNo,
      prnNo: activePaymentRequest.prnNo,
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

  const [currentStep, setCurrentStep] = useState('mobile');
  const isHomeScreen = activeRole === 'student' && currentStep !== 'dashboard';

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans relative bg-slate-50 transition-all duration-300">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className={`flex-1 w-full overflow-x-hidden ${isHomeScreen ? 'max-w-none p-0' : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12'}`}>
        {activeRole === 'student' ? (
          <StudentDashboard
            currentUser={currentUser}
            feesConfig={feesConfig}
            students={students}
            payments={payments}
            onSaveStudent={handleSaveStudent}
            onInitiatePayment={handleInitiatePayment}
            onViewInvoice={(trx) => setActiveInvoice(trx)}
            onClearAllPayments={handleClearAllPayments}
            onDeletePayment={handleDeletePayment}
            onOpenAuth={handleOpenAuth}
            onStepChange={(st) => setCurrentStep(st)}
          />
        ) : (
          <AdminDashboard
            feesConfig={feesConfig}
            students={students}
            payments={payments}
            onUpdateFeesConfig={handleUpdateFeesConfig}
            onUpdateSelectedStudentsFees={handleUpdateSelectedStudentsFees}
            onAddStudent={handleSaveStudent}
            onImportStudents={handleImportStudents}
            onClearAllStudents={handleClearAllStudents}
            onDeleteStudent={handleDeleteStudent}
            onClearAllPayments={handleClearAllPayments}
            onDeletePayment={handleDeletePayment}
            onViewInvoice={(trx) => setActiveInvoice(trx)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
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
