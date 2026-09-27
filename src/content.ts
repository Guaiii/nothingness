// 内容数据的唯一出口：集中集合加载、草稿过滤、分区归类与排序。
// 页面与组件不再各自调用 getCollection，路径规则见 src/lib/paths.ts。
// 见 ADR-0003（草稿在生产构建于此统一过滤）、ADR-0004（技术/娱乐分区）与架构评审候选①。
import { getCollection, type CollectionEntry } from 'astro:content';

export type TechEntry = CollectionEntry<'tech'>;
export type SeriesEntry = CollectionEntry<'series'>;
export type ChapterEntry = CollectionEntry<'chapters'>;
export type EntertainmentEntry = CollectionEntry<'entertainment'>;
export type AnyEntry = TechEntry | SeriesEntry | EntertainmentEntry;

/** 娱乐分区条目 = 集合（连载等） + 娱乐单篇（视频/图文/随笔） */
export type EntertainmentSectionEntry = SeriesEntry | EntertainmentEntry;

/** 生产构建剔除草稿；本地 dev 保留草稿以便预览 */
const isVisible = (entry: { data: { draft?: boolean } }): boolean =>
  !import.meta.env.PROD || entry.data.draft !== true;

/** 全部技术文（已过滤草稿），按日期倒序 */
export async function getTech(): Promise<TechEntry[]> {
  const entries = await getCollection('tech');
  return entries.filter(isVisible).sort(byDateDesc);
}

/** 全部集合（外表一张卡、内含子项），按日期倒序 */
export async function getSeries(): Promise<SeriesEntry[]> {
  const entries = await getCollection('series');
  return entries.filter(isVisible).sort(byDateDesc);
}

/** 全部娱乐单篇（视频/图文/附件/随笔），按日期倒序 */
export async function getEntertainmentSingles(): Promise<EntertainmentEntry[]> {
  const entries = await getCollection('entertainment');
  return entries.filter(isVisible).sort(byDateDesc);
}

/** 娱乐分区：集合 + 娱乐单篇，按日期倒序 */
export async function getEntertainment(): Promise<EntertainmentSectionEntry[]> {
  const [seriesList, singles] = await Promise.all([getSeries(), getEntertainmentSingles()]);
  return [...seriesList, ...singles].sort(byDateDesc);
}

/** 全部可公开内容（技术文 + 集合 + 娱乐单篇），用于标签聚合与站点地图 */
export async function getAllContent(): Promise<AnyEntry[]> {
  const [tech, seriesList, entertainment] = await Promise.all([
    getCollection('tech'),
    getCollection('series'),
    getCollection('entertainment'),
  ]);
  return [...tech, ...seriesList, ...entertainment].filter(isVisible);
}

/** 某个集合下的真实子项（来自 chapters 集合），按 order 升序 */
export async function getChaptersOfSeries(seriesSlug: string): Promise<ChapterEntry[]> {
  const chapters = await getCollection('chapters');
  return chapters
    .filter((chapter) => chapter.data.series === seriesSlug && isVisible(chapter))
    .sort((a, b) => a.data.order - b.data.order);
}

/** 全部标签（按出现频次倒序，次序相同时按字典序） */
export function collectTags(entries: Pick<AnyEntry, 'data'>[]): string[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([a, ca], [b, cb]) => cb - ca || a.localeCompare(b, 'zh-Hans-CN'))
    .map(([tag]) => tag);
}

/** 子项在其所属集合中的相邻项，不存在时为 null */
export function adjacentChapters(
  chapters: ChapterEntry[],
  currentSlug: string
): { prev: ChapterEntry | null; next: ChapterEntry | null } {
  const index = chapters.findIndex((chapter) => chapter.slug === currentSlug);
  return {
    prev: index > 0 ? chapters[index - 1] : null,
    next: index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null,
  };
}

function byDateDesc<T extends { data: { date?: Date } }>(a: T, b: T): number {
  const ta = a.data.date?.getTime() ?? 0;
  const tb = b.data.date?.getTime() ?? 0;
  return tb - ta;
}
