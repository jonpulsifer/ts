import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  UserCredential,
} from 'firebase/auth';
import { collection, doc, FirestoreError, setDoc } from 'firebase/firestore';
import * as firebase from '../lib/firebase';
import { destroyCookie, setCookie } from 'nookies';
import React, { ReactNode, useContext, useEffect, useState } from 'react';

interface SignInResults {
  user?: User;
  isNewUser?: boolean;
  error?: FirebaseError;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<SignInResults>;
  signInWithEmail: (email: string, password: string) => Promise<SignInResults>;
  signUpWithEmail: (email: string, password: string) => Promise<SignInResults>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextProps>({
  user: null,
  loading: true,
} as AuthContextProps);

const useAuth = () => {
  return useContext(AuthContext);
};

const createUser = (user: User) => {
  const users = collection(firebase.db, 'users');
  setDoc(doc(users, user.uid), {
    name: user.displayName,
    email: user.email,
    photoUrl: user?.photoURL,
    families: [],
  }).catch((error) => {
    const e = error as FirestoreError;
    console.log(JSON.stringify(e));
  });
};

interface Props {
  children: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (user: User) => {
    user
      .getIdToken(true)
      .then((token) => {
        setCookie(null, 'token', token);
        setUser(user);
      })
      .catch((error) => {
        destroyCookie(null, 'token');
        setUser(null);
        console.log(JSON.stringify(error));
      });
    setLoading(false);
  };

  const handleUserCredential = async (
    credential: UserCredential,
    isNewUser?: boolean,
  ): Promise<SignInResults> => {
    const { user } = credential;
    if (isNewUser) createUser(user);
    persistUser(user);
    return { user, isNewUser };
  };

  const signOut = async () => {
    setLoading(true);
    return firebase.auth.signOut().then(() => {
      destroyCookie(null, 'token');
      setUser(null);
      setLoading(false);
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(firebase.auth, email, password);
      return handleUserCredential(result);
    } catch (e) {
      setLoading(false);
      const error = e as FirebaseError;
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        firebase.auth,
        email,
        password,
      );
      return handleUserCredential(result, true);
    } catch (e) {
      setLoading(false);
      const error = e as FirebaseError;
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebase.auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
      return handleUserCredential(result, isNewUser);
    } catch (e) {
      setLoading(false);
      const error = e as FirebaseError;
      return { error };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      if (user) {
        persistUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { type SignInResults, AuthProvider, useAuth };
