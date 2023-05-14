'use client';
import { headers } from 'next/headers';
import Image from 'next/image';
import styles from './page.module.css';
import { Suspense } from 'react';

const { NODE_NAME, NODE_IP, POD_NAME, POD_IP } = process.env;
const headersMarkup = () => {
  let markup = '';
  for (const [key, value] of headers().entries()) {
    const line = `${key}: ${value}\n`;
    markup = markup.concat(line);
  }
  return markup;
};

export default async function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome!</h1>

        <div className={styles.grid}>
          <a href="#" className={styles.card}>
            <h2>k8s &darr;</h2>
            <code className={styles.code}>
              <pre>
                {`Node: ${NODE_NAME}
Node IP: ${NODE_IP}
Pod: ${POD_NAME}
Pod IP: ${POD_IP}`}
              </pre>
            </code>
          </a>
        </div>

        <div className={styles.grid}>
          <a href="#" className={styles.card}>
            <h2>Request Headers &darr;</h2>
            <code className={styles.code}>
              {/* <pre>{headersMarkup}</pre> but suspended */}
              <Suspense fallback={<div>Loading...</div>}>
                <pre>{headersMarkup()}</pre>
              </Suspense>
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
