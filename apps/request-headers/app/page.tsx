import { Card } from '@repo/ui/card';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

const { NODE_NAME, NODE_IP, POD_NAME, POD_IP, POD_CHANGE_ME } = process.env;
const isInKubernetes = Boolean(process.env.POD_NAME);

function KubernetesTable(): JSX.Element {
  return (
    <table className="min-w-full table-auto">
      <thead>
        <tr>
          <th className="text-left px-4 py-2">Item</th>
          <th className="text-left px-4 py-2">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b dark:border-slate-800 border-zinc-200">
          <td className="px-4 py-2">Node</td>
          <td className="px-4 py-2">{NODE_NAME}</td>
        </tr>
        <tr className="border-b dark:border-slate-800 border-zinc-200">
          <td className="px-4 py-2">Node IP</td>
          <td className="px-4 py-2">{NODE_IP}</td>
        </tr>
        <tr className="border-b dark:border-slate-800 border-zinc-200">
          <td className="px-4 py-2">Pod</td>
          <td className="px-4 py-2">{POD_NAME}</td>
        </tr>
        <tr className="border-b dark:border-slate-800 border-zinc-200">
          <td className="px-4 py-2">Pod IP</td>
          <td className="px-4 py-2">{POD_IP}</td>
        </tr>
        <tr className="border-b dark:border-slate-800 border-zinc-200">
          <td className="px-4 py-2">Pod Change Me</td>
          <td className="px-4 py-2">{POD_CHANGE_ME}</td>
        </tr>
      </tbody>
    </table>
  );
}

function EnvironmentTable() {
  return (
    <table className="min-w-full table-auto">
      <thead>
        <tr>
          <th className="text-left px-4 py-2">Item</th>
          <th className="text-left px-4 py-2">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(process.env).map(([key, value]) => {
          if (!value) return;
          return (
            <tr
              className="border-b dark:border-slate-800 border-zinc-200"
              key={key}
            >
              <td className="px-4 py-2">{key}</td>
              <td className="px-4 py-2 break-all">{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function HeadersTable() {
  const obj: Record<string, string> = {};

  // Iterate through the headers using Headers.values()
  for (const [key, value] of headers().entries()) {
    obj[key] = value;
  }
  return (
    <table className="min-w-full table-auto">
      <thead>
        <tr>
          <th className="text-left px-4 py-2">Item</th>
          <th className="text-left px-4 py-2">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(obj).map(([key, value]) => {
          if (!value) return;
          return (
            <tr
              className="border-b dark:border-slate-800 border-zinc-200"
              key={key}
            >
              <td className="px-4 py-2 whitespace-nowrap">{key}</td>
              <td className="px-4 py-2 break-all">{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const KubernetesCard = isInKubernetes ? (
  <Card subtitle="Kubernetes related environment variables" title="Kubernetes">
    <KubernetesTable />
  </Card>
) : null;

export const metadata: Metadata = {
  title: 'Request Headers',
  description: 'Home page for the Request Headers app',
};

// change me
const starColor = 'text-yellow-300 hover:animate-ping hover:text-pink-600';

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-full w-full">
      <h1 className="text-md sm:text-2xl md:text-3xl lg:text-4xl tracking-tight font-extrabold pt-4">
        <span>(∩ ͡° ͜ʖ ͡°)⊃</span>
        <span className="text-blue-600">━</span>
        <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
          <span className={starColor}>⭑</span>·~-.¸.·~
          <span className={starColor}>⭒</span>·._.·
        </span>
        <span className={starColor}>☆</span>
      </h1>
      <div className="flex flex-col gap-4 max-w-full sm:max-w-2xl">
        {KubernetesCard}
        <Card
          subtitle="All environment variables visible on the server"
          title="Environment Variables"
        >
          <EnvironmentTable />
        </Card>
        <Card
          subtitle="HTTP headers received by the server"
          title="Request Headers"
        >
          <HeadersTable />
        </Card>
      </div>
    </div>
  );
};

export default Home;
