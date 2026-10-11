#!/usr/bin/env node
// Read-only editorial checks. Astro build remains the schema/rendering authority.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const contentRoot = path.join(root, "src/content");
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("node .trae/skills/blog-writing/scripts/check-content.mjs [file.mdx ... | --all] [--json] [--strict]\n只读检查；错误退出 1，参数错误退出 2，建议默认不阻断；--strict 使建议也退出 1。");
  process.exit(0);
}
const flags = new Set(["--all", "--json", "--strict"]);
if (args.some((arg) => arg.startsWith("--") && !flags.has(arg))) {
  console.error("未知参数；使用 --help 查看用法。");
  process.exit(2);
}
function filesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory() ? filesIn(path.join(dir, item.name)) :
      /\.mdx?$/.test(item.name) ? [path.join(dir, item.name)] : []);
}
const requested = args.filter((arg) => !arg.startsWith("--"));
if ((!requested.length && !args.includes("--all")) || (requested.length && args.includes("--all"))) {
  console.error("指定内容文件，或单独使用 --all；使用 --help 查看用法。");
  process.exit(2);
}
const contentFiles = filesIn(contentRoot).filter((file) =>
  ["tech", "entertainment", "series", "chapters"].includes(path.relative(contentRoot, file).split(path.sep)[0]));
const inventory = contentFiles.flatMap((file) => {
  const relative = path.relative(contentRoot, file).split(path.sep).join("/");
  const [collection, ...segments] = relative.replace(/\.mdx?$/, "").split("/");
  try {
    return [{ file, collection, slug: segments.join("/"), data: matter(fs.readFileSync(file, "utf8")).data }];
  } catch {
    return [];
  }
});
const files = args.includes("--all") ? contentFiles :
  [...new Set(requested.map((file) => path.resolve(file)))];
const reports = [];
const core = ["title", "description", "tags", "date", "updated", "author", "draft", "cover"];
const skeleton = new Set(["tabs.astro", "search.astro", "toc-responsive.astro", "series-toc.astro", "base.astro"]);

function inspect(file) {
  const issues = [];
  const add = (level, code, message, node) => issues.push({
    level, code, message, ...(node?.position ? { line: node.position.start.line + offset } : {}),
  });
  let offset = 0;
  const relative = path.relative(contentRoot, file);
  const collection = relative.split(path.sep)[0];
  if (relative.startsWith("..") || !["tech", "entertainment", "series", "chapters"].includes(collection)) {
    add("error", "content-path", "文件必须位于当前项目的四类内容目录中。");
    return { file: path.relative(root, file), issues };
  }
  let parsed;
  try {
    parsed = matter(fs.readFileSync(file, "utf8"));
  } catch (error) {
    add("error", "frontmatter-parse", error.message);
    return { file: path.relative(root, file), issues };
  }
  const { data, content } = parsed;
  offset = parsed.orig.toString().slice(0, parsed.orig.toString().length - content.length).split("\n").length - 1;
  if (!parsed.orig.toString().startsWith("---")) add("error", "frontmatter-missing", "缺少 YAML frontmatter。");
  if (typeof data.title !== "string" || !data.title.trim()) add("error", "title", "title 应是非空字符串。");
  if (data.draft !== undefined && typeof data.draft !== "boolean") add("error", "draft-type", "draft 应为布尔值。");
  const allowed = collection === "chapters" ? ["title", "series", "order", "draft"] :
    [...core, ...(collection === "series" ? ["status"] : [])];
  for (const key of Object.keys(data)) {
    if (!allowed.includes(key)) add("warning", "unknown-field", `${key} 不在当前已核对的内容契约内；核对 src/content/config.ts。`);
  }
  if (collection !== "chapters") {
    for (const field of ["date", "updated"]) {
      if ((field === "date" || data[field] !== undefined) &&
          (!(data[field] instanceof Date) || !Number.isFinite(data[field].getTime()))) {
        add("error", "date-type", `${field} 使用未加引号的有效 YAML 日期。`);
      }
    }
    if (data.updated instanceof Date && data.date instanceof Date && data.updated < data.date) {
      add("warning", "date-order", "updated 早于 date，核对时间。");
    }
    if (!data.description?.trim?.()) add("warning", "description", "建议补摘要；当前搜索不匹配正文。");
    if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string"))) {
      add("error", "tags-type", "tags 应为字符串数组。");
    } else if (!data.tags?.length) add("warning", "tags", "尚未设置主题标签。");
    else if (new Set(data.tags).size !== data.tags.length) add("warning", "tags-duplicate", "标签有重复项。");
  } else {
    const parent = inventory.find((entry) => entry.collection === "series" && entry.slug === data.series);
    if (!parent) add("error", "series-missing", "series 没有对应的父集合文件。");
    if (typeof data.order !== "number" || !Number.isFinite(data.order)) add("error", "order-type", "order 应是有限数字。");
    if (inventory.some((entry) => entry.collection === "chapters" && entry.file !== file &&
      entry.data.series === data.series && entry.data.order === data.order)) {
      add("error", "order-duplicate", "同一集合有重复 order，排序会有歧义。");
    }
    if (parent?.data.draft === true && data.draft !== true) add("warning", "parent-draft", "父集合为草稿，该子项不会生成生产页面。");
  }
  if (collection === "series" && data.status !== undefined && !["连载中", "已完结", "暂停"].includes(data.status)) {
    add("error", "series-status", "status 只能为连载中、已完结、暂停。");
  }
  if (!content.trim()) add("error", "body-empty", "正文为空。");
  if (/待填写|replace-with-series-slug/.test(parsed.orig.toString())) add("warning", "placeholder", "仍有模板占位内容，替换后再交付。");
  const processor = createProcessor({ remarkPlugins: [remarkGfm] });
  let tree;
  try {
    tree = processor.parse(content);
  } catch (error) {
    add("error", "mdx-parse", error.message);
    return { file: path.relative(root, file), issues };
  }
  const nodes = [];
  function visit(node) {
    nodes.push(node);
    node.children?.forEach(visit);
  }
  visit(tree);
  const imports = new Map();
  for (const node of nodes.filter((node) => node.type === "listItem")) {
    if (!node.children?.length || !node.children.some((child) => plainText(child).trim())) add("warning", "empty-list-item", "列表项为空，补齐或移除残缺步骤。", node);
  }
  function plainText(node) {
    return node.value ?? node.children?.map(plainText).join("") ?? "";
  }
  for (const node of nodes.filter((node) => node.type === "mdxjsEsm")) {
    for (const statement of node.data?.estree?.body ?? []) {
      if (statement.type !== "ImportDeclaration") continue;
      const source = statement.source.value;
      const resolved = source.startsWith("@/") ? path.join(root, "src", source.slice(2)) :
        source.startsWith(".") ? path.resolve(path.dirname(file), source) : null;
      if (resolved && !fs.existsSync(resolved)) add("error", "import-missing", `导入文件不存在：${source}`, node);
      for (const specifier of statement.specifiers) imports.set(specifier.local.name, resolved);
    }
  }
  const headings = nodes.filter((node) => node.type === "heading");
  const h1 = headings.filter((node) => node.depth === 1);
  const single = ["tech", "entertainment"].includes(collection);
  if ((single && h1.length !== 1) || (!single && h1.length !== 0)) {
    add("error", "h1-count", single ? "单篇正文需要一个 Markdown H1。" : "页面已生成 H1，集合和子项正文不重复 H1。");
  }
  const plain = (node) => node.value ?? node.children?.map(plain).join("") ?? "";
  if (single && h1.length === 1 && plain(h1[0]) !== data.title) add("warning", "title-match", "正文 H1 与 title 不一致，核对是否有意使用不同展示标题。", h1[0]);
  let previous = 1;
  const titles = new Set();
  for (const heading of headings) {
    if (heading.depth > previous + 1) add("warning", "heading-gap", "标题跨级，建议保持 H2 → H3 → H4。", heading);
    previous = heading.depth;
    const title = plain(heading);
    if (titles.has(title)) add("warning", "heading-duplicate", "标题重复，检查目录是否容易区分。", heading);
    titles.add(title);
    if (heading.depth > 4) add("warning", "heading-deep", "H5/H6 不进入单篇目录。", heading);
  }
  function asset(value, node) {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return;
    const pathname = value.split(/[?#]/)[0];
    if (!pathname.includes(".")) return; // Content URLs and anchors need rendered route checks.
    let decoded;
    try { decoded = decodeURIComponent(pathname); } catch { add("error", "resource-url", "资源 URL 编码无效。", node); return; }
    const local = path.resolve(root, "public", `.${decoded}`);
    if (!local.startsWith(path.join(root, "public") + path.sep) || !fs.existsSync(local)) {
      add("error", "resource-missing", `站点资源不存在：${value}`, node);
    } else if (fs.statSync(local).isFile() && fs.statSync(local).size > 10 * 1024 * 1024) {
      add("warning", "resource-large", "资源超过约 10MB，附件应考虑站外下载。", node);
    }
  }
  asset(data.cover);
  for (const node of nodes) {
    if (node.type === "image") {
      if (!node.alt?.trim()) add("warning", "image-alt", "图片缺少有意义的替代文字。", node);
      asset(node.url, node);
    }
    if (node.type === "link" || node.type === "definition") asset(node.url, node);
    if (node.type === "code" && !node.lang) add("warning", "code-language", "代码围栏建议注明语言。", node);
    if (node.type === "code" && node.lang === "mermaid") add("warning", "mermaid", "当前没有 Mermaid 渲染插件。", node);
    if (node.type === "text" && /==[^=\n]+==/.test(node.value)) add("warning", "highlight", "==高亮== 不会渲染，改用 mark。", node);
    if (node.type === "text" && /\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/.test(node.value)) add("warning", "callout", "GitHub 提示语法没有专用渲染，使用正文提示类名。", node);
    if (!["mdxJsxFlowElement", "mdxJsxTextElement"].includes(node.type) || !node.name) continue;
    const component = imports.get(node.name);
    if (/^[A-Z]/.test(node.name) && !imports.has(node.name)) add("error", "component-import", `组件 ${node.name} 未导入；如来自外部组件映射，需单独确认。`, node);
    if (component && (skeleton.has(path.basename(component)) || component.includes(`${path.sep}layouts${path.sep}`))) {
      add("error", "skeleton-component", `${node.name} 属于页面骨架，不能嵌入正文。`, node);
    }
    const values = new Map();
    const present = new Set();
    for (const attribute of node.attributes ?? []) {
      if (attribute.type !== "mdxJsxAttribute") continue;
      present.add(attribute.name);
      const value = attribute.value;
      const expression = value?.data?.estree?.body?.[0]?.expression;
      values.set(attribute.name, value === null ? true : typeof value === "string" ? value :
        expression?.type === "Literal" ? expression.value : undefined);
    }
    if (component && fs.existsSync(component) && component.endsWith(".astro")) {
      const source = fs.readFileSync(component, "utf8");
      const props = source.match(/(?:export\s+)?interface\s+(?:Props|Quote)\s*\{([\s\S]*?)\}/)?.[1];
      for (const match of props?.matchAll(/^\s*(\w+)(\??):/gm) ?? []) {
        if (!match[2] && !present.has(match[1]) && !node.attributes.some((attr) => attr.type === "mdxJsxExpressionAttribute")) {
          add("error", "component-prop", `${node.name} 缺少必填属性 ${match[1]}。`, node);
        }
      }
    }
    for (const key of ["src", "href", "poster"]) asset(values.get(key), node);
    if (node.name === "img" || component?.endsWith(`${path.sep}figure.astro`)) {
      if (values.get("alt") === "" || !present.has("alt")) add("warning", "image-alt", "图片应提供有意义的 alt。", node);
    }
    if (component?.endsWith(`${path.sep}pinyin.astro`) && typeof values.get("text") === "string" && typeof values.get("pinyin") === "string") {
      if (Array.from(values.get("text")).length !== values.get("pinyin").trim().split(/\s+/).length) add("error", "pinyin-count", "汉字字符数与拼音音节数不匹配，标点也占字符。", node);
    }
    if (component?.endsWith(`${path.sep}tool.astro`) && values.get("collapsible") === true &&
        values.get("defaultOpen") === false && !values.get("title") && !values.get("description")) {
      add("warning", "tool-toggle", "默认关闭的工具缺少标题和说明，可能没有展开按钮。", node);
    }
  }
  return { file: path.relative(root, file), collection, draft: data.draft ?? false, issues };
}
for (const file of files) reports.push(inspect(file));
const errors = reports.flatMap((report) => report.issues).filter((issue) => issue.level === "error").length;
const warnings = reports.flatMap((report) => report.issues).filter((issue) => issue.level === "warning").length;
const output = { files: reports.length, errors, warnings, reports };
if (args.includes("--json")) console.log(JSON.stringify(output, null, 2));
else {
  for (const report of reports) {
    console.log(report.file);
    for (const issue of report.issues) console.log(`  ${issue.level === "error" ? "错误" : "建议"} ${issue.code}${issue.line ? `:${issue.line}` : ""} ${issue.message}`);
  }
  console.log(`检查 ${reports.length} 个文件，${errors} 个错误，${warnings} 条建议。Schema、运行时和事实核查仍需单独验证。`);
}
process.exitCode = errors || (args.includes("--strict") && warnings) ? 1 : 0;
