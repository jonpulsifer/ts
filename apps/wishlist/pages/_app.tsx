import 'styles/globals.css';
import 'react-toastify/dist/ReactToastify.min.css';

import { AuthProvider } from '../components/AuthProvider';
import Layout from '../components/Layout';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
// minified version is also included
// import 'react-toastify/dist/ReactToastify.min.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <ToastContainer />
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
