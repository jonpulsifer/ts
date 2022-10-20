import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
};

const firebase = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const db = getFirestore(firebase);

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(
    auth,
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'}`,
    {
      disableWarnings: false,
    },
  );

  connectFirestoreEmulator(
    db,
    process.env.FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1',
    Number(process.env.FIREBASE_FIRESTORE_EMULATOR_PORT) || 8080,
  );
}

export { auth, db, firebase };
