import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';

import { getServices } from '../../actions';
import {
  linkButton,
  metricsButtons,
  platformButton,
} from '../../components/icons';

const ServicesTable = () => {
  const services = getServices();
  const serviceRows = services.map((service) => (
    <TableRow key={service.id} href={`/services/${service.slug}`}>
      <TableCell>{service.name}</TableCell>
      <TableCell>{service.description}</TableCell>
      <TableCell>
        {service.status === 'Online' ? (
          <Badge color="green">Online</Badge>
        ) : (
          <Badge color="red">Offline</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {linkButton(service.url)}
          {platformButton(service.environments)}
          {metricsButtons(service.environments)}
        </div>
      </TableCell>
    </TableRow>
  ));
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader>Score</TableHeader>
          <TableHeader>Links</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{serviceRows}</TableBody>
    </Table>
  );
};

export default ServicesTable;
