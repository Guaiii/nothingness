// 内容集合 schema：技术文 / 作品(novel) / 章节(chapter)
// 统一 frontmatter 契约见 docs/adr/0003-unified-content-contract.md
import { z, defineCollection } from 'astro:content';

/** 技术文与作品共用的核心字段 */
const contentFrontmatter = {
  title: z.string(),
  description: z.string().optional(),
  tags: z.string().array().default([]),
  date: z.date().optional(),
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
  schema: z
    .object({
      ...contentFrontmatter,
      // 标识是否为连载小说；缺省视为单篇随笔
      isNovel: z.boolean().default(false),
      novelSlug: z.string().optional(),
      status: z.enum(['连载中', '已完结', '暂停']).optional(),
      // 仅作元数据保留；实际可访问章节以 chapters 集合为准
      chapters: z
        .array(
          z.object({
            title: z.string(),
            slug: z.string(),
            order: z.number(),
          })
        )
        .optional(),
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

export const collections = {
  tech: techCollection,
  novel: novelCollection,
  chapters: chapterCollection,
};
