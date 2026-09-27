import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getAllContent, getNovels } from "../content";
import { entryPath } from "../lib/paths";

// 全站内容订阅：技术文 + 作品（小说链接到其落地页）。草稿已在内容出口过滤。
export async function GET(context: APIContext) {
  const [entries, novels] = await Promise.all([getAllContent(), getNovels()]);

  const novelLinks = new Map<string, string>(
    novels.map((novel) => [novel.id, `/novel/${novel.slug}/`])
  );

  const items = [...entries]
    .sort((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0))
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      link: novelLinks.get(entry.id) ?? entryPath(entry),
      pubDate: entry.data.date ?? new Date(0),
      categories: entry.data.tags,
    }));

  return rss({
    title: "太虚幻境",
    description:
      "虚无、小说、技术(css、js、javascript、typescript、nodejs)、生活。这是一个虚无的世界，你应该能找到自己所追求的",
    site: context.site ?? "https://example.com",
    items,
    customData: "<language>zh-cn</language>",
  });
}
