import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe2PMPnRg-t0Epop6kCsFT_s8O732Jwv8",
  authDomain: "studentfees-22d17.firebaseapp.com",
  projectId: "studentfees-22d17",
  storageBucket: "studentfees-22d17.firebasestorage.app",
  messagingSenderId: "838884465703",
  appId: "1:838884465703:web:1d53e0ca20996d221ac202",
  measurementId: "G-QECNEF1ZP0"
};

// Initialize Firebase App & Firestore Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Analytics (Safe for all browser environments)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback
  });
}

/**
 * Save / Sync student records array (e.g. from Excel Upload) directly to Firebase Firestore "students" collection
 */
export const syncStudentsToFirestore = async (studentsList) => {
  if (!studentsList || studentsList.length === 0) return;
  try {
    const CHUNK_SIZE = 450; // Firestore limits write batches to 500 max
    for (let i = 0; i < studentsList.length; i += CHUNK_SIZE) {
      const chunk = studentsList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((std) => {
        const docId = String(std.id || std.prnNo || `std_${Date.now()}_${Math.random()}`);
        const docRef = doc(db, "students", docId);
        batch.set(docRef, std, { merge: true });
      });
      await batch.commit();
    }
    console.log(`🔥 Firebase Success: ${studentsList.length} Excel student records synced to Firebase Firestore in chunks!`);
  } catch (error) {
    console.error("⚠️ Firebase Firestore sync error:", error.message || error);
  }
};

/**
 * Fetch all student records from Firebase Firestore "students" collection
 */
export const fetchStudentsFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];
    querySnapshot.forEach((docSnap) => {
      students.push(docSnap.data());
    });
    return students;
  } catch (error) {
    console.warn("⚠️ Firebase Firestore fetch notice:", error.message || error);
    return null;
  }
};

/**
 * Save single payment record to Firebase Firestore "payments" collection
 */
export const syncPaymentToFirestore = async (paymentData) => {
  if (!paymentData || !paymentData.id) return;
  try {
    const docRef = doc(db, "payments", String(paymentData.id));
    await setDoc(docRef, paymentData, { merge: true });
    console.log("🔥 Firebase Success: Payment synced to Firestore:", paymentData.id);
  } catch (error) {
    console.warn("⚠️ Firebase payment sync notice:", error.message || error);
  }
};

/**
 * Fetch payment records from Firebase Firestore "payments" collection
 */
export const fetchPaymentsFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "payments"));
    const payments = [];
    querySnapshot.forEach((docSnap) => {
      payments.push(docSnap.data());
    });
    return payments;
  } catch (error) {
    console.warn("⚠️ Firebase payments fetch notice:", error.message || error);
    return null;
  }
};

/**
 * Delete single student record from Firebase Firestore
 */
export const deleteStudentFromFirestore = async (studentId) => {
  try {
    await deleteDoc(doc(db, "students", String(studentId)));
    console.log("🔥 Firebase Success: Deleted student from Firestore:", studentId);
  } catch (error) {
    console.warn("⚠️ Firebase delete student notice:", error.message || error);
  }
};

/**
 * Clear all student records in Firebase Firestore "students" collection
 */
export const clearFirestoreStudentsCollection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log("🔥 Firebase Success: Cleared students collection in Firestore");
  } catch (error) {
    console.warn("⚠️ Firebase clear students notice:", error.message || error);
  }
};

/**
 * Clear all payment records in Firebase Firestore "payments" collection
 */
export const clearFirestorePaymentsCollection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "payments"));
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log("🔥 Firebase Success: Cleared payments collection in Firestore");
  } catch (error) {
    console.warn("⚠️ Firebase clear payments notice:", error.message || error);
  }
};

export { app, db, analytics, firebaseConfig };
