// LocalStorage persistence manager for EduPay

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

// Initial Payment Records
const DEFAULT_PAYMENTS = [
  {
    id: 'pay_908123',
    razorpayPaymentId: 'pay_Pz92KxL88102a',
    studentId: 'std_102',
    studentName: 'Rahul Deshmukh',
    rollNo: 'CS2026-015',
    feeType: 'tuitionFee',
    feeTitle: 'Tuition Fee',
    amount: 45000,
    status: 'PAID',
    paymentMethod: 'Razorpay UPI / NetBanking',
    timestamp: '2026-07-23T11:20:00Z'
  }
];

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
  const index = students.findIndex(s => (studentData.email && s.email === studentData.email) || (studentData.prnNo && s.prnNo === studentData.prnNo) || s.id === studentData.id);
  
  const formattedStudent = {
    id: studentData.id || `std_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fullName: studentData.fullName || 'Student',
    rollNo: studentData.rollNo || 'N/A',
    prnNo: studentData.prnNo || 'N/A',
    mobile: studentData.mobile || studentData.educationDetails?.mobile || 'N/A',
    branch: studentData.branch || studentData.educationDetails?.branch || 'Computer Science',
    email: studentData.email || `${(studentData.fullName || 'student').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    educationDetails: {
      course: studentData.course || studentData.educationDetails?.course || `B.Tech ${studentData.branch || 'Computer Science'}`,
      branch: studentData.branch || studentData.educationDetails?.branch || 'Computer Science',
      year: studentData.year || studentData.educationDetails?.year || '3rd Year',
      semester: studentData.semester || studentData.educationDetails?.semester || '5th Semester',
      mobile: studentData.mobile || studentData.educationDetails?.mobile || 'N/A',
      collegeName: 'Government Engineering College'
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
  return updatedList;
};

export const saveMultipleStudents = (newStudentsList) => {
  let existingStudents = getStudents();
  
  newStudentsList.forEach((newStd) => {
    const formattedStudent = {
      id: `std_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      fullName: newStd.fullName || newStd.Name || 'Student',
      mobile: newStd.mobile || newStd['Mobile Number'] || newStd.Mobile || 'N/A',
      prnNo: newStd.prnNo || newStd['PRN No'] || newStd.PRN || 'N/A',
      branch: newStd.branch || newStd.Branch || newStd.Department || 'Computer Science',
      rollNo: newStd.rollNo || newStd['Roll No'] || newStd.RollNo || `RN-${Math.floor(100 + Math.random() * 900)}`,
      email: newStd.email || newStd['Gmail ID'] || newStd.Email || `${(newStd.fullName || newStd.Name || 'student').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      educationDetails: {
        course: `B.Tech ${newStd.branch || newStd.Branch || 'Computer Science'}`,
        branch: newStd.branch || newStd.Branch || 'Computer Science',
        year: '3rd Year',
        semester: '5th Semester',
        mobile: newStd.mobile || newStd['Mobile Number'] || 'N/A',
        collegeName: 'Government Engineering College'
      },
      registeredAt: new Date().toISOString()
    };

    const index = existingStudents.findIndex(s => (s.prnNo && s.prnNo === formattedStudent.prnNo && s.prnNo !== 'N/A'));
    if (index >= 0) {
      existingStudents[index] = { ...existingStudents[index], ...formattedStudent };
    } else {
      existingStudents = [formattedStudent, ...existingStudents];
    }
  });

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(existingStudents));
  return existingStudents;
};

export const deleteStudent = (studentId) => {
  const students = getStudents();
  const filtered = students.filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  return filtered;
};

export const getPayments = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
};

export const recordPayment = (paymentData) => {
  const payments = getPayments();
  const newPayment = {
    id: `pay_${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'PAID',
    ...paymentData
  };
  const updated = [newPayment, ...payments];
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
  return newPayment;
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
