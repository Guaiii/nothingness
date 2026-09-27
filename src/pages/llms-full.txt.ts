import type { APIContext } from "astro";
import { getAllContent, getNovels, getChaptersOfNovel } from "../content";

// llms-full.txt：把全部公开正文以 Markdown 汇编到一处，便于 LLM 一次性抓取。
// 内容出口已过滤草稿；正文取 MDX 源（entry.body，不含 frontmatter）。
export async function GET(context: APIContext): Promise<Response> {
  const origin = (context.site ?? new URL("https://example.com")).href.replace(/\/+$/, "");
  const [entries, novels] = await Promise.all([getAllContent(), getNovels()]);
  const novelIds = new Set<string>(novels.map((novel) => novel.id));

  const sections: string[] = [`# 太虚幻境 · 全文（${origin}）`, ""];

  for (const entry of entries) {
    sections.push(`# ${entry.data.title}`);
    if (entry.data.description) sections.push(`> ${entry.data.description}`);
    if (novelIds.has(entry.id)) sections.push("（小说作品，正文见各章节）");
    sections.push("");
    sections.push((entry.body ?? "").trim());
    sections.push("\n---\n");
  }

  // 追加真实章节正文
  for (const novel of novels) {
    const chapters = await getChaptersOfNovel(novel.slug);
    for (const chapter of chapters) {
      sections.push(`# ${novel.data.title} · ${chapter.data.title}`);
      sections.push("");
      sections.push((chapter.body ?? "").trim());
      sections.push("\n---\n");
    }
  }

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
