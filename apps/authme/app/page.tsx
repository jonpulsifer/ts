import { headers } from 'next/headers';
import Image from 'next/image';
import validateIdToken from '../lib/auth';
import styles from './page.module.css';

export default async function Home() {
  const auth = headers().get('authorization');
  const token = auth && auth.split(' ')[1];
  if (!token)
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Oops!</h1>
          <p className={styles.description}>
            No bearer token found in the Authorization header.
          </p>
        </main>
      </div>
    );
  const identity = await validateIdToken(token);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome {identity.getPayload()?.email}!
        </h1>

        <div className={styles.grid}>
          <a href="#" className={styles.card}>
            <h2>Identity &darr;</h2>
            <code className={styles.code}>
              {JSON.stringify(identity.getPayload(), undefined, '\r')}
            </code>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
