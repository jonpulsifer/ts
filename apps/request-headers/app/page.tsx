import { headers } from 'next/headers';
import { Card } from 'ui';

const {
  NODE_NAME,
  NODE_IP,
  POD_NAME,
  POD_IP,
  POD_LABEL_APP_INSTANCE,
  POD_CHANGE_ME,
} = process.env;

const KubernetesTable = () => (
  <table className="min-w-full table-auto overflow-wrap">
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

const HeadersTable = () => {
  const headersObj: { [key: string]: string } = {};

  // Iterate through the headers using Headers.values()
  for (const [key, value] of headers().entries()) {
    headersObj[key] = value;
  }
  return (
    <table className="min-w-full table-auto overflow-hidden">
      <thead>
        <tr>
          <th className="text-left px-4 py-2">Item</th>
          <th className="text-left px-4 py-2">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(headersObj).map(([key, value]) => (
          <tr
            key={key}
            className="border-b dark:border-slate-800 border-gray-200"
          >
            <td className="px-4 py-2">{key}</td>
            <td className="px-4 py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default async function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-full w-full">
      <h1 className="text-7xl font-bold pt-4">Request Headers</h1>

      <Card
        title="k8s &darr;"
        subtitle="Kubernetes related environment variables"
      >
        <div className="pb-4 px-4">
          <KubernetesTable />
        </div>
      </Card>

      <Card
        title="Request Headers &darr;"
        subtitle="HTTP Headers received by the server"
      >
        <div className="pb-4 px-4">
          <HeadersTable />
        </div>
      </Card>
    </div>
  );
}
