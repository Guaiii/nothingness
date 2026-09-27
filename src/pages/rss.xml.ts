import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getAllContent, getSeries } from "../content";
import { entryPath } from "../lib/paths";

// 全站内容订阅：技术文 + 集合 + 娱乐单篇。草稿已在内容出口过滤，date 为必填字段。
export async function GET(context: APIContext) {
  const [entries, seriesList] = await Promise.all([getAllContent(), getSeries()]);

  const seriesLinks = new Map<string, string>(
    seriesList.map((series) => [series.id, `/series/${series.slug}/`])
  );

  const items = [...entries]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? "",
      link: seriesLinks.get(entry.id) ?? entryPath(entry),
      pubDate: entry.data.date,
      categories: entry.data.tags,
    }));

  return rss({
    title: "太虚幻境",
    description:
      "技术、娱乐（集合 / 视频 / 图文 / 随笔）与生活。这是一个虚无的世界，你应该能找到自己所追求的",
    site: context.site ?? "https://example.com",
    items,
    customData: "<language>zh-cn</language>",
  });
}
