export type Environment = {
  id: string;
  name: string;
  platform: string;
  lifecycle: string;
};

export type Incident = {
  id: string;
  date: string;
  description: string;
  resolved: boolean;
};

export type Dependency = {
  id: string;
  name: string;
  slug: string;
  version: string;
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
  uptimeData: { x: number; y: number }[];
  responseTimeData: { x: number; y: number }[];
  incidents: Incident[];
  dependencies: Dependency[];
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
    uptimeData: [
      { x: 1, y: 100 },
      { x: 2, y: 99 },
      { x: 3, y: 100 },
    ],
    responseTimeData: [
      { x: 1, y: 100 },
      { x: 2, y: 120 },
      { x: 3, y: 95 },
    ],
    incidents: [
      {
        id: '1',
        date: '2023-04-01',
        description: 'Server downtime due to maintenance',
        resolved: true,
      },
    ],
    dependencies: [
      {
        id: '1',
        name: 'Next.js',
        slug: 'nextjs',
        version: '13.0.0',
      },
    ],
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
    uptimeData: [
      { x: 1, y: 90 },
      { x: 2, y: 85 },
      { x: 3, y: 0 },
    ],
    responseTimeData: [
      { x: 1, y: 200 },
      { x: 2, y: 250 },
      { x: 3, y: 0 },
    ],
    incidents: [
      {
        id: '1',
        date: '2023-04-02',
        description: 'Service offline due to critical bug',
        resolved: false,
      },
    ],
    dependencies: [
      {
        id: '1',
        name: 'TensorFlow',
        slug: 'tensorflow',
        version: '2.9.0',
      },
    ],
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
