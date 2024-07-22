import { Nav } from 'components/layout-with-nav';
import Spinner from 'components/Spinner';
import { Suspense } from 'react';

async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Nav>
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </Nav>
  );
}
export default Layout;
