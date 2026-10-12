// 内容集合 schema：技术文(tech) / 集合(series) / 集合子项(chapters) / 娱乐单篇(entertainment)
// 统一 frontmatter 契约见 docs/adr/0003-unified-content-contract.md
import { z, defineCollection } from 'astro:content';

/** 各内容集合共用的核心字段。date 必填，用于排序、RSS 与结构化数据。 */
const contentFrontmatter = {
  title: z.string(),
  description: z.string().optional(),
  tags: z.string().array().default([]),
  date: z.date(),
  updated: z.date().optional(),
  author: z.string().optional(),
  // 草稿：默认 false。生产构建在 src/content.ts 统一过滤。
  draft: z.boolean().default(false),
  // Open Graph / 社交分享配图（站点内路径）
  cover: z.string().optional(),
};

const techCollection = defineCollection({
  type: 'content',
  schema: z.object(contentFrontmatter),
});

// 集合：外表只有一张卡、内部由 chapters 子项组成的内容（如连载小说）。
const seriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    ...contentFrontmatter,
    // 连载状态，用于卡片与落地页徽标
    status: z.enum(['连载中', '已完结', '暂停']).optional(),
  }),
});

const chapterCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // 所属集合的 slug（CollectionEntry<'series'>.slug）
    series: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

// 娱乐分区的单篇内容（第三方视频 / 图片 / 附件 / 随笔），见 ADR-0004
const entertainmentCollection = defineCollection({
  type: 'content',
  schema: z.object(contentFrontmatter),
});

export const collections = {
  tech: techCollection,
  series: seriesCollection,
  chapters: chapterCollection,
  entertainment: entertainmentCollection,
};
