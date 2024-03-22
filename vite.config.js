import { defineConfig,loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'


export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({

    server: { https: true,host: '0.0.0.0',
      port: 443 },
    plugins: [react()],
  });
}
// https://vitejs.dev/config/
// export default defineConfig({

//   server: { https: true,host: '0.0.0.0',
//     port: 443 },
//   plugins: [react(),mkcert()],
// })