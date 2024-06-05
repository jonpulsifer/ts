import Toast from '../../components/Toaster';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
export default Layout;
