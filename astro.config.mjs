// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: 'prism',
  },
  vite: {
    resolve: {
      alias: [{ find: "@", replacement: "/src" }],
    },
  },
  site: "https://guaiii.github.io",
  // base: "/nothingness",
});
