import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('settings', 'routes/settings.tsx'),
  route('api/weather', 'routes/api.weather.ts'),
] satisfies RouteConfig;
