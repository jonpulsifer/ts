import { User } from 'firebase/auth';
import Link from 'next/link';
import React, { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { SignInResults, useAuth } from './AuthProvider';
import Card from './Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  const { signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();

  const welcome = (user: User) => {
    const person = user ? user.displayName || user.email : null;
    const text = person ? `Welcome ${person}!` : 'Welcome!';
    toast(text, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    });
  };

  const handleSignInResults = (results: SignInResults) => {
    const { error, user, isNewUser } = results;
    if (error) toast.error(error.message);
    if (user && isNewUser) {
      const toastMarkup = (
        <>
          Make sure to
          <Link href={`/user/${user.uid}/edit`}>
            <a className="font-semibold text-blue-600">
              {' '}
              complete your profile{' '}
            </a>
          </Link>
          with some extra festive details!
        </>
      );
      welcome(user);
      toast(toastMarkup, {
        autoClose: false,
        position: toast.POSITION.BOTTOM_CENTER,
        icon: <i className="fa fa-user text-blue-600 text-lg" />,
      });
    }
    if (user && !isNewUser) welcome(user);
  };

  const handleSubmit = (e: MouseEvent | FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Missing email or password', {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      const signin = isLoggingIn ? signInWithEmail : signUpWithEmail;
      signin(email, password).then((results) => handleSignInResults(results));
    }
  };

  const handleGoogle = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    signInWithGoogle().then((results) => handleSignInResults(results));
  };

  const loginMarkup = (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="p-6 space-y-6 w-80 max-w-screen"
    >
      <button
        className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 py-3 px-4 border rounded-lg border-gray-700 text-center inline-flex items-center w-full text-lg hover:bg-black hover:text-white transition ease-in-out duration-300"
        onClick={(e) => {
          handleGoogle(e);
        }}
      >
        <svg
          className="mr-2 -ml-1 w-10 h-7"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path
              fill="#4285F4"
              d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
            />
            <path
              fill="#34A853"
              d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
            />
            <path
              fill="#FBBC05"
              d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
            />
            <path
              fill="#EA4335"
              d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
            />
          </g>
        </svg>
        Continue with Google
      </button>
      <div className="flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
        <p className="text-center font-semibold mx-4 mb-0">OR</p>
      </div>

      <div className="">
        <input
          type="text"
          autoComplete="username"
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
        />
      </div>

      <div className="">
        <input
          type="password"
          autoComplete={isLoggingIn ? 'current-password' : 'new-password'}
          className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="inline-block px-4 py-3 bg-blue-600 text-white font-medium text-lg leading-snug rounded-lg hover:bg-blue-900 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-400 active:shadow-lg transition duration-300 ease-in-out w-full"
        data-mdb-ripple="true"
        data-mdb-ripple-color="light"
        type="submit"
      >
        {isLoggingIn ? 'Sign In' : 'Create Account'}
      </button>

      <p
        onClick={() => setIsLoggingIn(!isLoggingIn)}
        className="text-base text-gray-500"
      >
        {isLoggingIn ? (
          <>
            Don’t have an account yet?{' '}
            <a className="font-bold text-blue-600" href="#">
              Sign Up
            </a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a className="font-bold text-blue-600" href="#">
              Sign In
            </a>
          </>
        )}
      </p>
    </form>
  );

  return <Card>{loginMarkup}</Card>;
};

export default Login;
