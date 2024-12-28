import { Heading, Subheading, Text } from '@repo/ui';
import { Logo } from 'components/logo';

export default function NotFound() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <Logo />
      <Heading>404</Heading>
      <Subheading>Not Found</Subheading>
      <Text>Sorry, the page you are looking for does not exist.</Text>
    </div>
  );
}
