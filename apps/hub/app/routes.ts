import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('api/weather', 'routes/api.weather.ts'),
  route('api/exit', 'routes/api.exit.ts'),
] satisfies RouteConfig;
