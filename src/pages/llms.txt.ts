import type { APIContext } from "astro";
import { getAllContent, getSeries } from "../content";
import { entryPath } from "../lib/paths";

// llms.txt：面向 LLM 抓取器的站点内容索引。规范见 https://llmstxt.org/
export async function GET(context: APIContext): Promise<Response> {
  const origin = (context.site ?? new URL("https://example.com")).href.replace(/\/+$/, "");
  const [entries, seriesList] = await Promise.all([getAllContent(), getSeries()]);
  const seriesIds = new Set<string>(seriesList.map((series) => series.id));

  const absolute = (path: string) => new URL(path, `${origin}/`).href;

  const lines: string[] = [];
  lines.push("# 太虚幻境");
  lines.push("");
  lines.push(
    "个人长文站点，内容分为技术文（CSS / JS / TypeScript / Node.js 等）与娱乐分区（集合类内容、视频、图文与随笔）。"
  );
  lines.push("");
  lines.push("## 内容");
  lines.push("");

  for (const entry of entries) {
    const isSeries = seriesIds.has(entry.id);
    const link = isSeries ? absolute(`series/${entry.slug}/`) : absolute(entryPath(entry));
    const summary = entry.data.description ?? entry.data.title;
    lines.push(`- [${entry.data.title}](${link}): ${summary}`);
  }

  lines.push("");
  lines.push("## 可选");
  lines.push("");
  lines.push(`- [RSS 订阅](${absolute("rss.xml")}): 最新内容订阅源`);
  lines.push(`- [llms-full.txt](${absolute("llms-full.txt")}): 全部正文的纯文本汇编`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
