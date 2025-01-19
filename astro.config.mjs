// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  vite: {
    resolve: {
      alias: [{ find: "@", replacement: "/src" }],
    },
  },
  markdown: {
    shikiConfig: {
      // 选择 Shiki 内置的主题（或添加你自己的主题）
      // https://shiki.style/themes
      theme: "solarized-light",
      // 禁用默认配色
      // https://shiki.style/guide/dual-themes#without-default-color
      // (添加于 v4.12.0)
      defaultColor: false,
      // 添加自定义语言
      // 注意：Shiki 内置了无数语言，包括 .astro！
      // https://shiki.style/languages
      langs: ["astro", "js", "ts", "jsx", "tsx"],
      // 启用自动换行，以防止水平滚动
      wrap: true,
    },
  },
  site: "https://guaiii.github.io",
  base: "nothingness",
});
