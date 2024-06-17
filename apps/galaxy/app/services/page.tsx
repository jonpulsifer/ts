import { Divider, Heading } from '@repo/ui';

import ServicesTable from './components/services-table';

const Services = () => {
  return (
    <>
      <Heading>Services</Heading>
      <Divider className="my-4" />
      <ServicesTable />
    </>
  );
};

export default Services;
