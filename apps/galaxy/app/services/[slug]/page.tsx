import { LinkIcon } from '@heroicons/react/24/solid';
import { SiGithub } from '@icons-pack/react-simple-icons';
import {
  Badge,
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Divider,
  Heading,
  Link,
  NavbarItem,
  Subheading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';

import { getServiceBySlug } from '../../actions';

export default function Page({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  if (!service) {
    return <div>Service not found</div>;
  }
  const urlListItem = service.url ? (
    <>
      <DescriptionTerm>URL</DescriptionTerm>
      <DescriptionDetails>
        <Link href={service.url}>{service.url}</Link>
      </DescriptionDetails>
    </>
  ) : null;
  const statusBadge =
    service.status === 'Online' ? (
      <Badge color="green">Online</Badge>
    ) : (
      <Badge color="red">Offline</Badge>
    );

  return (
    <>
      <div className="flex flex-row">
        <Heading>{service.name}</Heading>
        <div className="flex grow justify-end gap-2">
          <NavbarItem>
            <LinkIcon />
            Visit
          </NavbarItem>
          <NavbarItem>
            <SiGithub />
            Repo
          </NavbarItem>
        </div>
      </div>
      <Divider />
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
          <Link href={service.repository}>{service.repository}</Link>
        </DescriptionDetails>
      </DescriptionList>
      <Subheading>Environments</Subheading>
      <Table>
        <TableHead>
          <TableHeader>Name</TableHeader>
          <TableHeader>Platform</TableHeader>
          <TableHeader>Lifecycle</TableHeader>
        </TableHead>
        <TableBody>
          {service.environments.map((env) => (
            <TableRow key={env.id}>
              <TableCell>
                <Link href="#">{env.name}</Link>
              </TableCell>
              <TableCell>{env.platform}</TableCell>
              <TableCell>{env.lifecycle}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
