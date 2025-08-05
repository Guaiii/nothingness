// 1. 从 `astro:content` 导入
import {z, defineCollection} from 'astro:content';
// 2. 定义集合
const novelCollection = defineCollection({
    type: 'content', // v2.5.0 及之后
    schema: z.object({
        title: z.string(),
        tags: z.string().array().optional(),
        author: z.string().optional(),
        description: z.string().optional(),
        isNovel: z.boolean().optional(), // 标识是否为小说
        novelSlug: z.string().optional(), // 小说的主标识符
        chapters: z.array(z.object({
            title: z.string(),
            slug: z.string(),
            order: z.number(),
        })).optional(),
        publishDate: z.date().optional(),
        status: z.enum(['连载中', '已完结', '暂停']).optional(),
    }),
});
const techCollection = defineCollection({
    type: 'content', // v2.5.0 及之后
    schema: z.object({
        title: z.string(),
        tags: z.string().array().optional(),
    }),
});
// 3. 导出一个 `collections` 对象来注册集合
//    这个键应该与 `src/content` 中的集合目录名匹配
export const collections = {
    novel: novelCollection,
    tech: techCollection,
};