import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // Main pages
  index('routes/home.tsx'),
  route('profiles', 'routes/profiles.tsx'),
  route('profiles/new', 'routes/profiles.new.tsx'),
  route('profiles/:id', 'routes/profiles.$id.tsx'),
  route('isos', 'routes/isos.tsx'),
  route('isos/new', 'routes/isos.new.tsx'),
  route('isos/:id', 'routes/isos.$id.tsx'),
  route('tftp/*', 'routes/tftp.$.tsx'),
  route('terminal', 'routes/terminal.tsx'),

  // API routes
  route('api/boot/:mac', 'routes/api.boot.$mac.ts'),
  route('api/profiles/:id/boot', 'routes/api.profiles.$id.boot.ts'),
  route('api/isos/:id/file', 'routes/api.isos.$id.file.ts'),
  route('api/tftp/*', 'routes/api.tftp.$.ts'),
] satisfies RouteConfig;
