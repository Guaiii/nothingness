import type { APIContext } from "astro";
import { getAllContent, getSeries, getChaptersOfSeries } from "../content";

// llms-full.txt：把全部公开正文以 Markdown 汇编到一处，便于 LLM 一次性抓取。
// 内容出口已过滤草稿；正文取 MDX 源（entry.body，不含 frontmatter）。
export async function GET(context: APIContext): Promise<Response> {
  const origin = (context.site ?? new URL("https://example.com")).href.replace(/\/+$/, "");
  const [entries, seriesList] = await Promise.all([getAllContent(), getSeries()]);
  const seriesIds = new Set<string>(seriesList.map((series) => series.id));

  const sections: string[] = [`# 太虚幻境 · 全文（${origin}）`, ""];

  for (const entry of entries) {
    sections.push(`# ${entry.data.title}`);
    if (entry.data.description) sections.push(`> ${entry.data.description}`);
    if (seriesIds.has(entry.id)) sections.push("（集合内容，正文见各子项）");
    sections.push("");
    sections.push((entry.body ?? "").trim());
    sections.push("\n---\n");
  }

  // 追加集合子项正文
  for (const series of seriesList) {
    const chapters = await getChaptersOfSeries(series.slug);
    for (const chapter of chapters) {
      sections.push(`# ${series.data.title} · ${chapter.data.title}`);
      sections.push("");
      sections.push((chapter.body ?? "").trim());
      sections.push("\n---\n");
    }
  }

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
