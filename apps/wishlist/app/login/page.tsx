import Login from '../../components/Login';
import { Finger_Paint } from '@next/font/google';

const logoFont = Finger_Paint({ weight: '400' });
const LoginPage = () => {
  return (
    <>
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-[url('/santa.png')] bg-no-repeat bg-right-top">
        <h1
          className={`mb-6 select-none text-5xl text-white drop-shadow-lg ${logoFont.className}`}
        >
          <span className="drop-shadow-lg">wishin.app</span>
        </h1>
        <div className="space-y-5">
          <Login />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
