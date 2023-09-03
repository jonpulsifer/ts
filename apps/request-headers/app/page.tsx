import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Accordion } from 'ui';

const {
  NODE_NAME,
  NODE_IP,
  POD_NAME,
  POD_IP,
  POD_LABEL_APP_INSTANCE,
  POD_CHANGE_ME,
} = process.env;
const isInKubernetes = !!process.env.POD_NAME;

const KubernetesTable = () => (
  <table className="min-w-full table-auto">
    <thead>
      <tr>
        <th className="text-left px-4 py-2">Item</th>
        <th className="text-left px-4 py-2">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b dark:border-slate-800 border-gray-200">
        <td className="px-4 py-2">app.kubernetes.io/instance</td>
        <td className="px-4 py-2">{POD_LABEL_APP_INSTANCE}</td>
      </tr>
      <tr className="border-b dark:border-slate-800 border-gray-200">
        <td className="px-4 py-2">Node</td>
        <td className="px-4 py-2">{NODE_NAME}</td>
      </tr>
      <tr className="border-b dark:border-slate-800 border-gray-200">
        <td className="px-4 py-2">Node IP</td>
        <td className="px-4 py-2">{NODE_IP}</td>
      </tr>
      <tr className="border-b dark:border-slate-800 border-gray-200">
        <td className="px-4 py-2">Pod</td>
        <td className="px-4 py-2">{POD_NAME}</td>
      </tr>
      <tr className="border-b dark:border-slate-800 border-gray-200">
        <td className="px-4 py-2">Pod IP</td>
        <td className="px-4 py-2">{POD_IP}</td>
      </tr>
      <tr className="border-b dark:border-slate-800 border-gray-200">
        <td className="px-4 py-2">Pod Change Me</td>
        <td className="px-4 py-2">{POD_CHANGE_ME}</td>
      </tr>
    </tbody>
  </table>
);

const EnvironmentTable = () => {
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
              key={key}
              className="border-b dark:border-slate-800 border-gray-200"
            >
              <td className="px-4 py-2">{key}</td>
              <td className="px-4 py-2 break-all">{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const HeadersTable = () => {
  const obj: { [key: string]: string } = {};

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
              key={key}
              className="border-b dark:border-slate-800 border-gray-200"
            >
              <td className="px-4 py-2 whitespace-nowrap">{key}</td>
              <td className="px-4 py-2 break-all">{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const KubernetesAccordion = isInKubernetes ? (
  <Accordion
    title="Kubernetes"
    subtitle="Kubernetes related environment variables"
    isOpen
  >
    <KubernetesTable />
  </Accordion>
) : null;

export const metadata: Metadata = {
  title: 'Request Headers',
  description: 'Home page for the Request Headers app',
};

const Home = async () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-full w-full">
      <h1 className="text-md sm:text-2xl md:text-3xl lg:text-4xl tracking-tight font-extrabold pt-4">
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          ▂▃▅▇█▓▒░
        </span>
        <span>(∩ ͡° ͜ʖ ͡°)⊃</span>
        <span className="text-indigo-600">━</span>
        <span className="hover:animate-ping hover:text-red-300">☆ﾟ. *</span>
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-400">
          ░▒▓█▇▅▃▂
        </span>
      </h1>
      <div className="flex flex-col gap-4 max-w-full sm:max-w-2xl">
        {KubernetesAccordion}
        <Accordion
          title="Environment Variables"
          subtitle="All environment variables visible on the server"
        >
          <EnvironmentTable />
        </Accordion>
        <Accordion
          title="Request Headers"
          subtitle="HTTP headers received by the server"
        >
          <HeadersTable />
        </Accordion>
      </div>
    </div>
  );
};

export default Home;
