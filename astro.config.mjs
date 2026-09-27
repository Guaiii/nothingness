// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// TODO(部署前必填)：替换为你的正式根域名（不带末尾斜杠），用于 canonical / sitemap / OG。
export const SITE_URL = "https://example.com";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // 根域名部署：base 必须为 "/"（GitHub 项目页时期的 "/nothingness" 已废弃，见 ADR-0002）
  base: "/",
  integrations: [mdx(), sitemap()],
  markdown: {
    syntaxHighlight: "prism",
  },
  vite: {
    resolve: {
      alias: [{ find: "@", replacement: "/src" }],
    },
  },
});
