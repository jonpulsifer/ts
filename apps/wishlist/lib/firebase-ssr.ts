import { FirebaseError } from 'firebase-admin';
import { applicationDefault, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const databaseURL = process.env.NODE_ENV === 'development'
? `http://${process.env.FIREBASE_FIRESTORE_EMULATOR_HOST}:${process.env.FIREBASE_FIRESTORE_EMULATOR_PORT}`
: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`;

const firebaseConfig = {
  credential: applicationDefault(),
  databaseURL
};

const admin = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(admin);
const auth = getAuth(admin);
function isFirebaseError(error: unknown): error is FirebaseError {
  return (error as FirebaseError).code !== undefined;
}

export { admin, auth, db, isFirebaseError };
