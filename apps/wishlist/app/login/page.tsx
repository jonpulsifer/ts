import Login from '../../components/Login';
import { Finger_Paint } from '@next/font/google';

const fingerPaint = Finger_Paint({
  weight: '400',
  subsets: ['latin'],
});

const logoClass = `select-none text-6xl text-white drop-shadow drop-shadow-xl ${fingerPaint.className}`;

const LoginPage = () => {
  return (
    <>
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-[url('/santa.png')] bg-no-repeat bg-right-top">
        <div className="space-y-5">
          <h1 className={logoClass}>
            <span className="drop-shadow drop-shadow-2xl">wishin.app</span>
          </h1>
          <Login />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
