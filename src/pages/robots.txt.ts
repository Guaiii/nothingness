import type { APIContext } from "astro";

// robots：放行全站抓取，指向 sitemap；404 用页面级 noindex 排除。
export function GET(context: APIContext): Response {
  const origin = context.site ?? new URL("https://example.com");
  const sitemap = new URL("sitemap-index.xml", origin).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
