import { LinkIcon } from '@heroicons/react/24/solid';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Badge } from "../../components/badge";
import { Separator } from "../../components/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import { Button } from "../../components/button";
// import { Chart } from "../../components/chart";

import { getServiceBySlug } from '../../actions';

const DescriptionList = ({ children }: { children: React.ReactNode }) => (
  <dl className="space-y-4">{children}</dl>
);

const DescriptionTerm = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-500">{children}</dt>
);

const DescriptionDetails = ({ children }: { children: React.ReactNode }) => (
  <dd className="mt-1 text-gray-900">{children}</dd>
);

export default function Page({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  if (!service) {
    return <div>Service not found</div>;
  }
  const urlListItem = service.url ? (
    <>
      <DescriptionTerm>URL</DescriptionTerm>
      <DescriptionDetails>
        <a href={service.url} className="text-blue-600 hover:underline">{service.url}</a>
      </DescriptionDetails>
    </>
  ) : null;
  const statusBadge =
    service.status === 'Online' ? (
      <Badge variant="default" className="bg-green-500">Online</Badge>
    ) : (
      <Badge variant="default" className="bg-red-500">Offline</Badge>
    );

  return (
    <>
      <div className="flex flex-row">
        <h1 className="text-3xl font-bold">{service.name}</h1>
        <div className="flex grow justify-end gap-2">
          <Button variant="outline" asChild>
            <a href={service.url}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Visit
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={service.repository}>
              <SiGithub className="h-4 w-4 mr-2" />
              Repo
            </a>
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <DescriptionList>
        <DescriptionTerm>Description</DescriptionTerm>
        <DescriptionDetails>{service.description}</DescriptionDetails>
        {urlListItem}
        <DescriptionTerm>Latency</DescriptionTerm>
        <DescriptionDetails>{service.latency}ms</DescriptionDetails>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>{statusBadge}</DescriptionDetails>
        <DescriptionTerm>Version</DescriptionTerm>
        <DescriptionDetails>{service.version}</DescriptionDetails>
        <DescriptionTerm>Repository</DescriptionTerm>
        <DescriptionDetails>
          <a href={service.repository} className="text-blue-600 hover:underline">{service.repository}</a>
        </DescriptionDetails>
      </DescriptionList>
      <h2 className="text-2xl font-semibold mt-6 mb-4">Environments</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Platform</TableHeader>
            <TableHeader>Lifecycle</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {service.environments.map((env) => (
            <TableRow key={env.id}>
              <TableCell>
                <a href="#" className="text-blue-600 hover:underline">{env.name}</a>
              </TableCell>
              <TableCell>{env.platform}</TableCell>
              <TableCell>{env.lifecycle}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <h2 className="text-2xl font-semibold mt-6 mb-4">Health Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* <Chart type="line" data={service.uptimeData} title="Uptime" />
        <Chart type="line" data={service.responseTimeData} title="Response Time" /> */}
      </div>
      <h2 className="text-2xl font-semibold mt-6 mb-4">Recent Incidents</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {service.incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>{incident.date}</TableCell>
              <TableCell>{incident.description}</TableCell>
              <TableCell>
                <Badge variant={incident.resolved ? "default" : "destructive"} className={incident.resolved ? "bg-green-500" : "bg-red-500"}>
                  {incident.resolved ? "Resolved" : "Ongoing"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <h2 className="text-2xl font-semibold mt-6 mb-4">Dependencies</h2>
      <ul className="list-disc pl-5">
        {service.dependencies.map((dep) => (
          <li key={dep.id}>
            <a href={`/services/${dep.slug}`} className="text-blue-600 hover:underline">{dep.name}</a> - {dep.version}
          </li>
        ))}
      </ul>
    </>
  );
}
