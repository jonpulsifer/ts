'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import santa from 'public/santaicon.png';
import Spinner from '../../components/Spinner';

const welcome = (name?: string | null) => {
  const text = name ? `Ho ho ho! Welcome ${name}!` : 'Ho ho ho! Welcome!';
  toast.success(text, {
    icon: '🎅',
    style: {
      background: '#ff0066',
      color: '#fff',
    },
  });
};

function LoginPage() {
  const [showLoading, setShowLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (showLoading) {
    return <Spinner />;
  }

  const handleGoogle = (e: React.MouseEvent | React.FormEvent) => {
    setShowLoading(true);
    e.preventDefault();
    signIn('google', { redirect: true, redirectTo: '/home' }).finally(() => {
      setShowLoading(false);
      welcome();
    });
  };

  return (
    <div className="relative flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-200 to-blue-900 dark:from-blue-900 dark:via-slate-900 dark:to-black animate-gradient-shift" />

      {/* Snowfall effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="snow"
            style={
              {
                '--size': `${Math.random() * 1 + 0.2}rem`,
                '--left': `${Math.random() * 100}%`,
                '--delay': `${Math.random() * 5}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: isHovered ? [0, -10, 10, -10, 10, 0] : 0 }}
          transition={{ duration: 0.5 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Image
            priority
            alt="Santa"
            height={120}
            src={santa}
            width={120}
            className="drop-shadow-2xl"
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center text-5xl font-bold tracking-tight text-white drop-shadow-lg"
        >
          wishin.app
        </motion.h1>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative mt-10 w-full max-w-sm space-y-6"
      >
        <h1 className="font-semibold text-center items-center text-2xl text-white drop-shadow-lg">
          Sign in to continue
        </h1>
        <form className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-row items-center justify-center"
          >
            <button
              className="group flex justify-center font-semibold w-full h-12 p-3 rounded-xl 
                        bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white
                        shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]
                        transition-all duration-300 ease-out"
              onClick={handleGoogle}
              type="button"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
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
                <span className="font-medium">Continue with Google</span>
                <Sparkles className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
