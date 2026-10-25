// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The hoisted entities copy is v7 (no lib/decode.js); @react-email/render needs v4.5.0.
const entitiesV4 = path.resolve(
  __dirname,
  "node_modules/@react-email/render/node_modules/entities",
);

// Server routes need non-VITE_ env vars (e.g. LOVABLE_API_KEY). Load them into
// process.env for server-side code only — never into the client envDefine block.
function serverEnvPlugin(): Plugin {
  return {
    name: "load-server-env",
    configResolved(config) {
      const serverEnv = loadEnv(config.mode, process.cwd(), "");
      Object.assign(process.env, serverEnv);
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [serverEnvPlugin()],
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(entitiesV4, "lib/decode.js"),
        "entities/lib/encode.js": path.resolve(entitiesV4, "lib/encode.js"),
        entities: entitiesV4,
      },
    },
  },
});
