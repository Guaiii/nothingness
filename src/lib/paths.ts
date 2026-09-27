// 站点路径的唯一出口：所有内部链接都从这里生成，集中处理 base 与斜杠规则。
// 见架构评审候选①，ADR-0003。服务端与客户端（经 Vite 打包的 <script>）均可安全引用，
// 因为 import.meta.env.BASE_URL 会在构建期被静态替换。

/** 去掉结尾斜杠后的 base，根路径部署时为空字符串 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

function join(path: string): string {
  const normalized = path.replace(/^\/+/, '');
  return normalized ? `${base}/${normalized}` : `${base}/`;
}

/** 任一内容条目（技术文 / 作品）的规范链接：/{collection}/{slug} */
export function entryPath(
  entry: { collection: string; slug: string }
): string {
  return join(`${entry.collection}/${entry.slug}`);
}

/** 小说章节页链接 */
export function chapterPath(novelSlug: string, chapterSlug: string): string {
  return join(`novel/${novelSlug}/${chapterSlug}`);
}

/** 章节内容条目按 novel/<chapter-slug> 目录组织，URL 只取末段 */
export function chapterRouteSlug(chapterSlug: string): string {
  return chapterSlug.split("/").pop() ?? chapterSlug;
}

/** 标签聚合页链接 */
export function tagPath(tag: string): string {
  return join(`tags/${encodeURIComponent(tag)}`);
}

/** 首页 */
export function homePath(): string {
  return join("");
}

/** 静态资源链接（传入相对站点根的路径，如 favicon.svg） */
export function assetPath(path: string): string {
  return join(path.replace(/^\/+/, ''));
}
