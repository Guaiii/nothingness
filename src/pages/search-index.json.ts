import { getAllContent, getSeries } from "../content";
import { entryPath } from "../lib/paths";

// 搜索索引：构建期生成的静态 JSON，仅在用户打开搜索面板时才被 fetch（见 ADR-0005 省带宽）。
// 相比把全量数据内联进首页，首屏 HTML 不随内容增长。
export async function GET(): Promise<Response> {
  const [entries, seriesList] = await Promise.all([getAllContent(), getSeries()]);
  const seriesIds = new Set<string>(seriesList.map((series) => series.id));

  const index = entries.map((entry) => ({
    title: entry.data.title,
    description: entry.data.description ?? "",
    tags: entry.data.tags,
    collection: entry.collection,
    url: seriesIds.has(entry.id) ? `/series/${entry.slug}/` : entryPath(entry),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // 内容更新后重新部署即变化；短缓存兼顾省流量与时效
      "Cache-Control": "public, max-age=300",
    },
  });
}
