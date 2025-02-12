import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBle0YCLosSqhZSHxJKfz1jQvrXmC2vy9Y",
  authDomain: "copy-65ad7.firebaseapp.com",
  projectId: "copy-65ad7",
  storageBucket: "copy-65ad7.firebasestorage.app",
  messagingSenderId: "515717763896",
  appId: "1:515717763896:web:999ac31d93d97bb98067cd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collection references
export const COPIES_COLLECTION = 'copies';

// Helper function to convert Firestore timestamp to Date
export const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};
