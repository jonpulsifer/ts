import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Card } from '@repo/ui/card';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import ClientComponentWithEnvironmentVariables from './components/client';

const { NODE_NAME, NODE_IP, POD_NAME, POD_IP, POD_CHANGE_ME } = process.env;
const isInKubernetes = Boolean(process.env.POD_NAME);

function KubernetesTable(): JSX.Element {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Item</TableHeader>
          <TableHeader>Value</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Node</TableCell>
          <TableCell>{NODE_NAME}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Node IP</TableCell>
          <TableCell>{NODE_IP}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Pod</TableCell>
          <TableCell>{POD_NAME}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Pod IP</TableCell>
          <TableCell>{POD_IP}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Pod Change Me</TableCell>
          <TableCell>{POD_CHANGE_ME}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function EnvironmentTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Item</TableHeader>
          <TableHeader>Value</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(process.env).map(([key, value]) => {
          if (!value) return;
          return (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function HeadersTable() {
  const obj: Record<string, string> = {};

  // Iterate through the headers using Headers.values()
  for (const [key, value] of headers().entries()) {
    obj[key] = value;
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Item</TableHeader>
          <TableHeader>Value</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(obj).map(([key, value]) => {
          if (!value) return;
          return (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
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
        <span className="text-indigo-600">━</span>
        <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
          <span className={starColor}>⭑</span>·~-.¸.·~
          <span className={starColor}>⭒</span>·._.·
        </span>
        <span className={starColor}>☆</span>
      </h1>
      <div className="flex flex-col gap-4 max-w-full sm:max-w-2xl">
        {KubernetesCard}
        <ClientComponentWithEnvironmentVariables />
        <Card
          title="Request Headers"
          subtitle="HTTP headers received by the server"
        >
          <HeadersTable />
        </Card>
        <Card
          title="Server Environment"
          subtitle="All environment variables visible on the server"
        >
          <EnvironmentTable />
        </Card>
      </div>
    </div>
  );
};

export default Home;
