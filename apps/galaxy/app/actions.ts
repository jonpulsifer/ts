export type Environment = {
  id: string;
  name: string;
  platform: string;
  lifecycle: string;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  environments: Environment[];
  url?: string;
  latency?: number;
  status: string;
  version: string;
  repository: string;
};

const SERVICES: Service[] = [
  {
    id: '1',
    name: 'wishin.app',
    slug: 'wishin-app',
    description: 'wishin.app is a wishlist app',
    environments: [
      {
        id: '1',
        name: 'wishlist-next',
        platform: 'Vercel',
        lifecycle: 'Production',
      },
    ],
    url: 'https://wishin.app',
    status: 'Online',
    latency: 100,
    version: '1.0.0',
    repository: 'https://github.com/jonpulsifer/ts',
  },
  {
    id: '2',
    name: 'Rosie',
    slug: 'rosie',
    description: 'Rosie is a chatbot',
    environments: [
      {
        id: '1',
        name: 'rosie-app',
        platform: 'Kubernetes',
        lifecycle: 'Development',
      },
    ],
    status: 'Offline',
    latency: 250,
    version: '1.0.0',
    repository: 'https://github.com/jonpulsifer/ts',
  },
];

export const getServiceById = (id: string): Service | null => {
  return SERVICES.find((service) => service.id === id) || null;
};

export const getServiceBySlug = (slug: string): Service | null => {
  return SERVICES.find((service) => service.slug === slug) || null;
};

export const getServices = (): Service[] => {
  return SERVICES;
};
