import Login from '../../components/Login';

const LoginPage = () => {
  return (
    <>
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <div className="space-y-5">
          <Login />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
