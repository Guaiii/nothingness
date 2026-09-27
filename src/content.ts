// 内容数据的唯一出口：集中集合加载、草稿过滤、分区归类与排序。
// 页面与组件不再各自调用 getCollection，路径规则见 src/lib/paths.ts。
// 见 ADR-0003（草稿在生产构建于此统一过滤）、ADR-0004（技术/娱乐分区）与架构评审候选①。
import { getCollection, type CollectionEntry } from 'astro:content';

export type TechEntry = CollectionEntry<'tech'>;
export type NovelEntry = CollectionEntry<'novel'>;
export type ChapterEntry = CollectionEntry<'chapters'>;
export type MediaEntry = CollectionEntry<'media'>;
export type AnyEntry = TechEntry | NovelEntry | MediaEntry;

/** 娱乐分区条目 = 作品（小说/随笔） + 媒体内容 */
export type EntertainmentEntry = NovelEntry | MediaEntry;

/** 生产构建剔除草稿；本地 dev 保留草稿以便预览 */
const isVisible = (entry: { data: { draft?: boolean } }): boolean =>
  !import.meta.env.PROD || entry.data.draft !== true;

/** 全部技术文（已过滤草稿），按日期倒序 */
export async function getTech(): Promise<TechEntry[]> {
  const entries = await getCollection('tech');
  return entries.filter(isVisible).sort(byDateDesc);
}

/** novel 集合中的全部条目（含小说与随笔，已过滤草稿） */
export async function getNovelEntries(): Promise<NovelEntry[]> {
  const entries = await getCollection('novel');
  return entries.filter(isVisible);
}

/** 仅连载小说（isNovel=true），按日期倒序 */
export async function getNovels(): Promise<NovelEntry[]> {
  return (await getNovelEntries())
    .filter((entry) => entry.data.isNovel)
    .sort(byDateDesc);
}

/** 单篇随笔（novel 集合中非连载作品） */
export async function getEssays(): Promise<NovelEntry[]> {
  return (await getNovelEntries()).filter((entry) => !entry.data.isNovel);
}

/** 全部媒体内容（已过滤草稿），按日期倒序 */
export async function getMedia(): Promise<MediaEntry[]> {
  const entries = await getCollection('media');
  return entries.filter(isVisible).sort(byDateDesc);
}

/** 娱乐分区：作品（含此前漏掉的随笔） + 媒体内容，按日期倒序 */
export async function getEntertainment(): Promise<EntertainmentEntry[]> {
  const [novelEntries, media] = await Promise.all([getNovelEntries(), getMedia()]);
  return [...novelEntries, ...media].sort(byDateDesc);
}

/** 全部可公开内容（技术文 + 作品 + 媒体），用于标签聚合与站点地图 */
export async function getAllContent(): Promise<AnyEntry[]> {
  const [tech, novel, media] = await Promise.all([
    getCollection('tech'),
    getCollection('novel'),
    getCollection('media'),
  ]);
  return [...tech, ...novel, ...media].filter(isVisible);
}

/** 某部小说下的真实章节（来自 chapters 集合），按 order 升序 */
export async function getChaptersOfNovel(novelSlug: string): Promise<ChapterEntry[]> {
  const chapters = await getCollection('chapters');
  return chapters
    .filter((chapter) => chapter.data.novel === novelSlug && isVisible(chapter))
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

/** 章节在其所属小说中的相邻章节，不存在时为 null */
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
