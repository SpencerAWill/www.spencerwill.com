import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Published to the host by the appPort entries in .devcontainer/devcontainer.json.
// Changing either number means changing it there too, or the mapping points at
// nothing.
const DEV_PORT = 5173;
const PREVIEW_PORT = 4173;

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],

  server: {
    // Vite binds 127.0.0.1 by default. Inside a container that loopback is the
    // container's own, so Docker's published port forwards to nothing and the
    // host gets a connection reset. `true` means 0.0.0.0 -- every interface,
    // including the one Docker actually forwards through.
    host: true,
    port: DEV_PORT,
    // Vite otherwise walks quietly to 5174, 5175, ... when the port is taken,
    // at which point the fixed host mapping is aimed at a dead port and the
    // failure looks like a broken dev server rather than a busy port. With a
    // published mapping, failing loudly is the correct outcome.
    strictPort: true,
  },

  preview: {
    host: true,
    port: PREVIEW_PORT,
    strictPort: true,
  },
});

export default config;
