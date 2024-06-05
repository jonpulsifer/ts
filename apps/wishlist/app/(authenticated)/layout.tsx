import { Nav } from 'components/layout-with-nav';

import Toast from '../../components/Toaster';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Nav>
      {children}
      <Toast />
    </Nav>
  );
}
export default Layout;
