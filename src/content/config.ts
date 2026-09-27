// 内容集合 schema：技术文 / 作品(novel) / 章节(chapter) / 媒体(media)
// 统一 frontmatter 契约见 docs/adr/0003-unified-content-contract.md
import { z, defineCollection } from 'astro:content';

/** 技术文 / 作品 / 媒体共用的核心字段。date 必填，用于排序、RSS 与结构化数据。 */
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

const novelCollection = defineCollection({
  type: 'content',
  schema: z.object({
    ...contentFrontmatter,
    // 标识是否为连载小说；缺省视为单篇随笔
    isNovel: z.boolean().default(false),
    novelSlug: z.string().optional(),
    status: z.enum(['连载中', '已完结', '暂停']).optional(),
    // 注意：章节的唯一事实源是 chapters 集合，小说 frontmatter 不再维护 chapters 列表。
  }),
});

const chapterCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // 所属小说的 slug（CollectionEntry<'novel'>.slug）
    novel: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

// 娱乐分区中的富媒体单篇条目（第三方视频 / 图片 / 附件），见 ADR-0004
const mediaCollection = defineCollection({
  type: 'content',
  schema: z.object(contentFrontmatter),
});

export const collections = {
  tech: techCollection,
  novel: novelCollection,
  chapters: chapterCollection,
  media: mediaCollection,
};
