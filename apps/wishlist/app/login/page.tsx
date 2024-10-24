'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Spinner from '../../components/Spinner';
import santa from '../../public/santaicon.png';

const welcome = (name?: string | null) => {
  const text = name ? `Welcome ${name}!` : 'Welcome!';
  toast.success(text);
};

function LoginPage() {
  const [showLoading, setShowLoading] = useState(false);

  if (showLoading) {
    return <Spinner />;
  }

  const handleGoogle = (e: React.MouseEvent | React.FormEvent) => {
    setShowLoading(true);
    e.preventDefault();
    signIn('google', { callbackUrl: '/people', redirect: false }).finally(
      () => {
        setShowLoading(false);
        welcome();
      },
    );
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center leading-9 tracking-tight px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center">
        <Image priority alt="Santa" height={100} src={santa} width={100} />

        <h1 className="mt-4 text-center text-4xl font-bold leading-9 tracking-tight">
          wishin.app
        </h1>
      </div>

      <div className="mt-10 w-full max-w-sm space-y-4">
        <h1 className="font-semibold text-center items-center text-xl">
          Sign in to continue
        </h1>
        <form
          className="space-y-4"
          // onSubmit={(e) =>
          //   register ? handleSignUpWithEmail(e) : handleSignInWithEmail(e)
          // }
        >
          {/* <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-zinc-200"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="santa@example.com"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-800 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-zinc-900 dark:focus:bg-zinc-800 dark:placeholder-zinc-700"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-zinc-200"
              >
                Password
              </label>
              <div className="text-sm" onClick={() => setRegister(!register)}>
                <a
                  href="#"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400"
                >
                  {register ? 'Already have an account?' : 'Need an account?'}
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-800 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:border-gray-800 dark:text-gray-400 dark:focus:text-gray-200 dark:bg-zinc-900 dark:focus:bg-zinc-800 dark:placeholder-zinc-700"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {register ? 'Create Account' : 'Sign in'}
            </button>
          </div>
          <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 dark:before:border-zinc-400 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300 dark:after:border-zinc-400">
            <p className="mx-4 mb-0 text-center font-semibold dark:text-zinc-400">
              OR
            </p>
          </div> */}
          <div className="flex flex-row items-center justify-center">
            <button
              className="flex justify-center font-semibold w-full h-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 dark:focus:ring-indigo-600 p-2 border rounded-lg border-gray-700 dark:hover:border-indigo-600 dark:border-zinc-800 text-center inline-flex items-center bg-white text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-black dark:hover:text-indigo-500 hover:bg-black hover:text-white transition ease-in-out duration-100"
              onClick={(e) => {
                handleGoogle(e);
              }}
              type="button"
            >
              <svg
                className="mr-1 -ml-1 w-10 h-6"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    fill="#34A853"
                  />
                  <path
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
              Continue with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
