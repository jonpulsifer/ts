import { Nav } from 'components/layout-with-nav';

async function Layout({ children }: { children: React.ReactNode }) {
  return <Nav>{children}</Nav>;
}
export default Layout;
