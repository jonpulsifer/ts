'use client';

import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from 'ui';

export const Login = () => {
  const [isLoading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = !!session?.user && status === 'authenticated';

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    }
    if (status === 'authenticated' || status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const handleSignIn = async (e: React.MouseEvent | React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    signIn('google', { callbackUrl: '/', redirect: false });
  };
  const handleSignOut = async (e: React.MouseEvent | React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const results = await signOut({ callbackUrl: '/', redirect: false });
    router.push(results.url);
  };
  // render loading... if loading, Sign in with Google if not authenticated, or Sign out if authenticated
  const googleButton = (
    <button
      className="flex w-full h-10 justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 dark:focus:ring-indigo-600 p-2 border rounded-lg border-gray-700 dark:hover:border-indigo-600 dark:border-slate-800 text-center inline-flex items-center bg-white text-black dark:bg-slate-900 dark:text-white dark:hover:bg-black dark:hover:text-indigo-500 hover:bg-black hover:text-white transition ease-in-out duration-100"
      onClick={(e) => {
        handleSignIn(e);
      }}
    >
      <svg
        className="mr-1 -ml-1 w-10 h-6"
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
  );

  const button = (
    <button
      className="flex w-full h-10 justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 dark:focus:ring-indigo-600 p-2 border rounded-lg border-gray-700 dark:hover:border-indigo-600 dark:border-slate-800 text-center inline-flex items-center bg-white text-black dark:bg-slate-900 dark:text-white dark:hover:bg-black dark:hover:text-indigo-500 hover:bg-black hover:text-white transition ease-in-out duration-100"
      onClick={(e) => {
        handleSignOut(e);
      }}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Sign Out'}
    </button>
  );
  return (
    <Card title="Login" subtitle="This is a card with a Google Sign In button">
      <div className="p-4">
        {isLoading ? button : isAuthenticated ? button : googleButton}
      </div>
    </Card>
  );
};
