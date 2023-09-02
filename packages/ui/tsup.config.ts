import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  treeshake: false,
  splitting: true,
  entry: ['src/**/*.tsx', 'src/**/*.ts'],
  format: ['esm'],
  dts: true,
  minify: true,
  clean: true,
  external: ['react', 'next'],
  esbuildOptions: (options) => {
    // Append "use client" to the top of the react entry point
    options.banner = {
      js: '"use client";',
    };
  },
  ...options,
}));
