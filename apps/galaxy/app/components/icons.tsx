import { ChartBarIcon, LinkIcon } from '@heroicons/react/20/solid';
import {
  SiArgo,
  SiArgoHex,
  SiVercel,
  SiVercelHex,
} from '@icons-pack/react-simple-icons';
import { Button } from '@repo/ui';

import { Environment } from '../actions';
export const linkButton = (url?: string) => {
  return url ? (
    <Button outline href={url}>
      <LinkIcon />
      <span className="text-xs max-lg:hidden">Visit</span>
    </Button>
  ) : null;
};

// return buttons for the environments
export const platformButton = (environments: Environment[]) => {
  return environments.map((env) => {
    switch (env.platform) {
      case 'Vercel':
        return (
          <Button outline key={env.id}>
            <SiVercel color={SiVercelHex} />
            <span className="text-xs max-lg:hidden">{env.name}</span>
          </Button>
        );
      case 'Kubernetes':
        return (
          <Button outline key={env.id}>
            <SiArgo color={SiArgoHex} />
            <span className="text-xs max-lg:hidden">{env.name}</span>
          </Button>
        );
      default:
        return null;
    }
  });
};

export const metricsButtons = (environments: Environment[]) => {
  return environments.map((env) => {
    return (
      <Button outline key={env.id}>
        <ChartBarIcon />
        <span className="text-xs max-lg:hidden">{env.name} metrics</span>
      </Button>
    );
  });
};
