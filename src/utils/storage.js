import { 
  syncStudentsToFirestore, 
  syncPaymentToFirestore, 
  deleteStudentFromFirestore, 
  clearFirestoreStudentsCollection, 
  clearFirestorePaymentsCollection 
} from './firebase';

const STORAGE_KEYS = {
  FEES_CONFIG: 'edupay_fees_config',
  STUDENTS: 'edupay_students',
  PAYMENTS: 'edupay_payments',
  CURRENT_USER: 'edupay_current_user'
};

// Initial Default Fee Settings (Configured by Admin)
const DEFAULT_FEES_CONFIG = {
  tuitionFee: 45000,
  tuitionDueDate: '2026-08-15',
  tuitionDescription: 'Semester 5 Tuition & Academic Fee',
  examFee: 2500,
  examDueDate: '2026-08-25',
  examDescription: 'Semester Examination & Hall Ticket Fee',
  backlogFee: 1500,
  backlogDueDate: '2026-09-15',
  backlogDescription: 'Backlog Paper & Re-examination Fee',
  academicYear: '2026-2027',
  updatedAt: new Date().toISOString()
};

// Default Sample Registered Students
const DEFAULT_STUDENTS = [
  {
    id: 'std_101',
    email: 'sakshpatil@gmail.com',
    fullName: 'Sakshi Patil',
    rollNo: 'CS2026-042',
    prnNo: '20240325001192',
    mobile: '9876543210',
    branch: 'Computer Engineering',
    educationDetails: {
      course: 'B.Tech Computer Science',
      branch: 'Computer Engineering',
      year: '3rd Year',
      semester: '5th Semester',
      mobile: '9876543210',
      collegeName: 'Government College of Engineering'
    },
    registeredAt: '2026-07-20T10:30:00Z'
  },
  {
    id: 'std_102',
    email: 'rahul.deshmukh@gmail.com',
    fullName: 'Rahul Deshmukh',
    rollNo: 'CS2026-015',
    prnNo: '20240325001144',
    mobile: '9822114455',
    branch: 'Information Technology',
    educationDetails: {
      course: 'B.Tech Information Technology',
      branch: 'Information Technology',
      year: '3rd Year',
      semester: '5th Semester',
      mobile: '9822114455',
      collegeName: 'Government College of Engineering'
    },
    registeredAt: '2026-07-22T14:15:00Z'
  },
  {
    id: 'std_103',
    email: 'anita.shinde@gmail.com',
    fullName: 'Anita Shinde',
    rollNo: 'ME2026-008',
    prnNo: '20240325001188',
    mobile: '9988776655',
    branch: 'Mechanical Engineering',
    educationDetails: {
      course: 'B.Tech Mechanical Engineering',
      branch: 'Mechanical Engineering',
      year: '3rd Year',
      semester: '5th Semester',
      mobile: '9988776655',
      collegeName: 'Government College of Engineering'
    },
    registeredAt: '2026-07-24T09:00:00Z'
  }
];

// Initial Payment Records (Default empty so fee status shows PENDING until student pays)
const DEFAULT_PAYMENTS = [];

export const getFeesConfig = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.FEES_CONFIG);
  if (!saved) return DEFAULT_FEES_CONFIG;
  try {
    return { ...DEFAULT_FEES_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    return DEFAULT_FEES_CONFIG;
  }
};

export const saveFeesConfig = (config) => {
  const updated = { ...config, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.FEES_CONFIG, JSON.stringify(updated));
  return updated;
};

export const getStudents = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
};

export const saveStudent = (studentData) => {
  const students = getStudents();
  const index = students.findIndex(s => 
    (studentData.id && s.id === studentData.id) ||
    (studentData.prnNo && studentData.prnNo !== 'N/A' && s.prnNo && s.prnNo !== 'N/A' && s.prnNo === studentData.prnNo) ||
    (studentData.email && studentData.email !== 'student@gmail.com' && s.email && s.email === studentData.email)
  );
  
  const formattedStudent = {
    id: studentData.id || `std_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fullName: studentData.fullName || 'Student',
    rollNo: studentData.rollNo || 'N/A',
    prnNo: studentData.prnNo || 'N/A',
    mobile: studentData.mobile || studentData.educationDetails?.mobile || 'N/A',
    course: studentData.course || studentData.educationDetails?.course || 'Engineering',
    scheme: studentData.scheme || studentData.educationDetails?.scheme || 'Polytechnic',
    year: studentData.year || studentData.educationDetails?.year || '2nd Year',
    semester: studentData.semester || studentData.educationDetails?.semester || '4th Semester',
    branch: studentData.branch || studentData.educationDetails?.branch || 'Computer Engineering',
    email: studentData.email || `${(studentData.fullName || 'student').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    educationDetails: {
      course: studentData.course || studentData.educationDetails?.course || 'Engineering',
      scheme: studentData.scheme || studentData.educationDetails?.scheme || 'Polytechnic',
      year: studentData.year || studentData.educationDetails?.year || '2nd Year',
      semester: studentData.semester || studentData.educationDetails?.semester || '4th Semester',
      branch: studentData.branch || studentData.educationDetails?.branch || 'Computer Engineering',
      mobile: studentData.mobile || studentData.educationDetails?.mobile || 'N/A',
      collegeName: 'Netaji Polytechnic / Pharmacy College'
    },
    registeredAt: studentData.registeredAt || new Date().toISOString()
  };

  let updatedList;
  if (index >= 0) {
    students[index] = { ...students[index], ...formattedStudent };
    updatedList = [...students];
  } else {
    updatedList = [formattedStudent, ...students];
  }
  
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedList));
  // Sync to Firebase Firestore database
  syncStudentsToFirestore(updatedList);
  return updatedList;
};

export const saveMultipleStudents = (newStudentsList, replaceAll = true) => {
  let existingStudents = replaceAll ? [] : getStudents();
  
  newStudentsList.forEach((newStd, index) => {
    // Filter out invalid dummy records
    if (!newStd.fullName || newStd.fullName === 'Student' || newStd.fullName.toLowerCase() === 'candidate name') {
      return;
    }

    const formattedStudent = {
      id: `std_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
      fullName: newStd.fullName || 'Student',
      mobile: newStd.mobile || 'N/A',
      prnNo: newStd.prnNo || 'N/A',
      course: newStd.course || 'Polytechnic',
      scheme: newStd.scheme || newStd.course || 'Polytechnic',
      year: newStd.year || '2nd Year',
      semester: newStd.semester || newStd.educationDetails?.semester || '4th Semester',
      branch: newStd.branch || (newStd.course === 'Engineering' ? 'Computer Engineering' : 'N/A'),
      rollNo: newStd.rollNo || `RN-${Math.floor(100 + Math.random() * 900)}`,
      email: newStd.email || `${(newStd.fullName || 'student').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      educationDetails: {
        course: newStd.course || 'Polytechnic',
        scheme: newStd.scheme || newStd.course || 'Polytechnic',
        year: newStd.year || '2nd Year',
        semester: newStd.semester || newStd.educationDetails?.semester || '4th Semester',
        branch: newStd.branch || (newStd.course === 'Engineering' ? 'Computer Engineering' : 'N/A'),
        mobile: newStd.mobile || 'N/A',
        collegeName: 'Netaji Polytechnic / Pharmacy College'
      },
      registeredAt: new Date().toISOString()
    };

    const existingIdx = existingStudents.findIndex(s => (s.prnNo && s.prnNo === formattedStudent.prnNo && s.prnNo !== 'N/A'));
    if (existingIdx >= 0) {
      existingStudents[existingIdx] = { ...existingStudents[existingIdx], ...formattedStudent };
    } else {
      existingStudents.push(formattedStudent);
    }
  });

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(existingStudents));
  // Sync full Excel student directory list to Firebase Firestore database
  syncStudentsToFirestore(existingStudents);
  return existingStudents;
};

export const clearAllStudents = () => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  clearFirestoreStudentsCollection();
  return [];
};

export const deleteStudent = (studentId) => {
  const students = getStudents();
  const filtered = students.filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  deleteStudentFromFirestore(studentId);
  return filtered;
};

export const getPayments = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
};

export const recordPayment = (paymentData) => {
  const payments = getPayments();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newPayment = {
    id: `pay_${Date.now()}`,
    timestamp: now.toISOString(),
    date: dateStr,
    time: timeStr,
    dateTime: `${dateStr}, ${timeStr}`,
    status: 'PAID',
    ...paymentData
  };
  const updated = [newPayment, ...payments];
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
  // Sync new payment transaction to Firebase Firestore database
  syncPaymentToFirestore(newPayment);
  return newPayment;
};

export const clearAllPayments = () => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  clearFirestorePaymentsCollection();
  return [];
};

export const deletePayment = (paymentId) => {
  const payments = getPayments();
  const filtered = payments.filter(p => p.id !== paymentId);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(filtered));
  return filtered;
};

export const getCurrentUser = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return saved ? JSON.parse(saved) : null;
};

export const setCurrentUser = (user) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
};
