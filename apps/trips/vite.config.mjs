import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {tripsPublicApiPlugin} from './src/hosting/publicApiProxy.js';

const root = path.dirname(fileURLToPath(import.meta.url));

// Standalone build: never import the shared app's Vite configuration/plugins.
export default defineConfig({
  root,
  base: '/',
  plugins: [
    react(),
    tripsPublicApiPlugin(),
    {
      name: 'reject-shared-application-code',
      generateBundle() {
        for (const id of this.getModuleIds()) {
          if (id.includes('/apps/web/src/') ||
              (id.includes('/packages/app/') && !id.includes('/assets/fonts/'))) {
            throw new Error(`Travel build must not load shared application code: ${id}`);
          }
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'trips-assets/build',
    rollupOptions: {
      input: {
        trips: path.join(root, 'trips/index.html'),
        login: path.join(root, 'trips/login/index.html'),
        programs: path.join(root, 'trips/programs/index.html'),
        reground: path.join(root, 'trips/reground-jeju/index.html'),
      },
    },
  },
});
