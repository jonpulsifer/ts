'use client';

import { SignInResults, useAuth } from 'components/AuthProvider';
import Card from 'components/Card';
import { dismissable } from 'components/Toaster';
import { User } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import santa from 'public/santaicon.png';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) router.push('/people');
  }, [router, user]);

  const welcome = (user: User) => {
    const person = user ? user.displayName || user.email : null;
    const text = person ? `Welcome ${person}!` : 'Welcome!';
    toast.success(text);
  };

  const handleSignInResults = (results: SignInResults) => {
    const { error, user, isNewUser } = results;
    if (error) toast.error(error.message);
    if (!user) {
      console.log('something went wrong');
      return;
    }

    if (user && isNewUser) {
      const toastMarkup = (
        <>
          Make sure to
          <Link
            className="font-bold text-indigo-600"
            href={`/user/${user.uid}/edit`}
          >
            {' '}
            complete your profile{' '}
          </Link>
          with some extra festive details!
        </>
      );
      welcome(user);
      dismissable(toastMarkup);
    }
    if (user && !isNewUser) welcome(user);
  };

  const handleGoogle = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    signInWithGoogle().then((results) => handleSignInResults(results));
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">
      <Card>
        <div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm items-center">
          <div className="flex flex-row justify-center items-center">
            <Image src={santa} alt="Santa" width={100} height={100} />
            <h1 className="text-3xl font-bold dark:text-white text-black">
              wishin.app
            </h1>
          </div>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <form onSubmit={(e) => handleGoogle(e)} className="max-w-screen">
            <button
              className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 py-3 px-4 border rounded-lg border-gray-700 text-center inline-flex items-center w-full text-lg bg-white text-black dark:bg-black dark:text-white dark:hover:bg-black dark:hover:text-indigo-600 hover:bg-black hover:text-white transition ease-in-out duration-300"
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
          </form>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
