# 内容契约与 MDX 呈现

这是根据当前仓库整理的写作参考。使用具体能力前，核对本节给出的源码路径；功能说明中的文字不能替代编译或实际呈现验证。

## 内容类型、路径与元数据

依据：`CONTEXT.md`、`src/content/config.ts`、`src/content.ts`、`src/lib/paths.ts`、ADR-0001/0003/0004/0005。

| 内容 | 文件位置 | 页面路径 | 正文标题 |
| --- | --- | --- | --- |
| 技术文 | `src/content/tech/<slug>.mdx` | `/tech/<slug>` | 自己写一个 H1 |
| 娱乐单篇 | `src/content/entertainment/<slug>.mdx` | `/entertainment/<slug>` | 自己写一个 H1 |
| 集合 | `src/content/series/<slug>.mdx` | `/series/<slug>` | 页面已有 H1，正文不重复 |
| 子项 | `src/content/chapters/<series-slug>/<chapter-slug>.mdx` | `/series/<series-slug>/<chapter-slug>` | 页面已有 H1，正文不重复 |

`slug` 默认由文件路径生成，采用英文小写短横线。保留既有文件名可以保留链接。技术主题的个人思考可归技术文；独立生活随笔归娱乐单篇；按顺序连续阅读的内容才建集合。`novel`、`media` 是历史命名，不再创建对应目录。

技术文、娱乐单篇和集合共用字段：

| 字段 | Schema 要求 | 编辑用途 |
| --- | --- | --- |
| `title` | 必填字符串 | 卡片、搜索、页面元信息；独立正文不会自动显示它 |
| `date` | 必填日期 | 发布时间、首页排序与 RSS；使用未加引号的 YAML 日期 |
| `description` | 可选字符串 | 编辑时建议填写，供元信息、搜索匹配与 RSS 使用 |
| `tags` | 字符串数组，默认 `[]` | 横跨分区的聚合标签，正文不参与当前搜索匹配 |
| `updated` | 可选日期 | 实质更新日期；技术文/娱乐单篇会传入页面元信息 |
| `author` | 可选字符串 | 有确实作者信息才填 |
| `draft` | 布尔值，默认 `false` | 新建内容显式写 `true`，防止无意进入生产站点 |
| `cover` | 可选字符串 | 站点内配图路径；技术文/娱乐单篇用于分享元信息，不自动插入正文 |

集合另外接受 `status`，只能为 `连载中`、`已完结`、`暂停`。子项独立 schema 只有 `title`、`series`、`order`、`draft`，不套用单篇的 frontmatter。`series` 对应父集合 slug，`order` 为数字；编辑时确保同集合顺序唯一，避免排序歧义。

当前集合布局没有把 `cover`、`updated` 传给 `SiteLayout`；不要承诺填了这些字段就会在集合页面生效。父集合为草稿时，其子项没有生产页面；子项自己也可独立标草稿。集合目录唯一来源是 `chapters` 文件，不在父级 frontmatter 写 `chapters` 数组。

单篇结构示意，保存时替换标题、日期、标签和正文：

```mdx
---
title: "内容标题"
description: "一句交代核心观点、适用范围或阅读收益。"
tags: ["主题标签"]
date: 2026-10-10
draft: true
---

# 内容标题

导语说明这篇内容讨论什么。

## 主线

正文。

### 必要的分支

正文。
```

技术文/娱乐单篇页面只自动渲染标签与导航，没有正文标题、作者或日期栏；需要读者直接看到的范围说明放在导语中。子项页用父集合标签和作者，内部目录是集合子项导航，不是单篇标题目录。

## 标题是导航结构，也是视觉层级

依据：`src/pages/[...path].astro`、`src/pages/series/[seriesSlug]/index.astro`、`src/pages/series/[seriesSlug]/[chapter].astro`、`src/component/toc-responsive.astro`、`src/styles/mdx-theme.css`。

| 写法 | 桌面正文样式 | 单篇目录用途 |
| --- | --- | --- |
| `#` | 32px、红色底线；窄屏 28px | 不收录 |
| `##` | 24px、灰色底线、红色竖标；窄屏 22px | 主分组，目录自行编号 |
| `###` | 19px、红色菱形与文字；窄屏 18px | 当前 H2 下的子项 |
| `####` | 16px、墨色 | 当前 H2 下的子项，更深缩进 |
| `#####` / `######` | 14px | 不收录，长文定位优先用 H2–H4 |

H3 与 H4 在目录中都归入最近的 H2，并非完整递归树。正文优先连续层级。H2 前未出现 H2 的 H3 会被当作一个分组起点，能编译但不适合文章组织。

目录使用 Astro `entry.render()` 返回的 Markdown headings。组件内部生成的标题不会自动成为目录项，例如 `Tool` 的标题是运行时渲染的 H3；原生 JSX 标题也不要假定等同于 Markdown 标题导出。需要导航的标题放在普通 Markdown 中，最终核对编译后的 ID 和链接，尤其是重复标题、标点与英文混排。

单篇目录在 ≥1200px 常驻；≤1199px 出现按钮；≤768px 有全屏抽屉样式。769–1199px 的 `.toc` 当前仍是 `display: none`，不能承诺按钮能正常展开，此为已有实现限制。集合侧栏使用自己的布局，断点为 768px，不能套用单篇目录说明。

## Markdown、JSX 与语法边界

依据：`astro.config.mjs`、Astro/MDX 默认 GFM 配置、`src/styles/mdx-theme.css`。

- 当前是 Astro + MDX，组件主要是 `.astro`，没有配置 React 集成。直接 `import` 后使用现有 Astro 组件，不加 React 的 `client:*` 指令。
- GFM 默认支持表格、删除线、任务列表和脚注。任务列表输出只读 checkbox，不能当成会保存状态的待办工具。脚注先检查实际锚点与回链，长注可改为单独的补充段落。
- 行内代码与围栏代码可用，围栏标明语言；Prism 负责高亮，未配置代码复制按钮、行号和标题插件。
- `==高亮==` 没有对应插件，会保留等号；用 `<mark>关键词</mark>`。粗体已经是主题红色，不用再层层嵌套高亮。
- `<u>`、`<kbd>`、`<abbr title="全称">`、`<sup>`、`<sub>` 可直接使用。缩写第一次出现的解释写在正文，悬停提示只作补充。
- GitHub 的 `> [!NOTE]` 没有专用解析器，会成为普通引用文字。提示条用下面的 JSX 类名。
- 未接入数学或 Mermaid 插件。`$...$`、`$$...$$` 不渲染成公式；`mermaid` 围栏不变成图。简单公式用可读文字或上下标，需要图表时另提渲染能力需求。
- JSX 中 `{}` 是表达式、`<...>` 是标签；展示代码、占位语法和 JSON 时用行内代码/代码围栏，避免意外被解释为表达式。
- JSX 的块级内容与 Markdown 间保留空行，结束标签独占一行；单行 `<div>**重点**</div>` 中星号可能保留为字面量。以实际输出为准，简单提示优先显式 `<strong>` 与 `<p>`。
- 站点正文统一米色、红黑配色与直角边框。样式已为标题、列表和强调加装饰，正文无需手动补菱形、箭头、标题编号或额外颜色。

```mdx
<div class="tip">
  <p><strong>提示：</strong>说明具体做法和适用条件。</p>
</div>

<details>
<summary>查看补充说明</summary>

这里可以使用 **Markdown**。重要步骤保留在折叠块外。

</details>
```

`warning` 用于具体风险，`note` 用于背景补充，`tip` 用于可操作技巧，`important` 用于必要前提。它们只有样式，没有特殊提醒逻辑。`details` 是浏览器原生折叠，无需客户端脚本。

## 引用、批注、注音与工具

依据：对应 `src/component/` 文件及 ADR-0003。建议用 `@/component/...` 别名，避免子项目录层级变化导致相对路径错误。

| 表达 | 适用目的与约束 |
| --- | --- |
| Markdown `>` | 原文引用，正文右侧括线；支持多段与嵌套，出处另外写明 |
| `Quote` | 简短引语，黑底浅字；只放短文字或行内元素，外壳为 `<p><q>`，不放多段 Markdown |
| `MarginNote` | 引文加逐条解释；宽屏页边批注，≤1499px 回到正文下方；批注必须对应所引文字 |
| `Pinyin` | 生僻字或读音本身影响理解时注音，不给整篇无差别加拼音 |
| `Tool` + 工具 | 读者需要实际操作时使用；当前现成工具只有 `Calculator` |

`Quote` 的 `cite` 是 `<q>` 的出处 URL，不显示署名，默认还是无关的百度地址，因此使用时显式传真实出处，或用 `cite=""` 并注明是作者自己的话。可选 `isInline`、`center` 默认为 `false`。

`MarginNote` 的 `note` 必填；`label` 默认为“编者按”，`source` 显示来源文字，`cite` 为引文的出处 URL。`source` 不自动成为链接，读者需要访问来源时在正文另外提供链接。`MarginNote` 已用于 `tech-overview.mdx`，但尚未写入 ADR-0003 正文白名单，编辑时报告这一记录差异。

```mdx
import MarginNote from '@/component/margin-note.astro';
import Pinyin from '@/component/pinyin.astro';
import Tool from '@/component/tool.astro';
import Calculator from '@/component/tools/calculator.astro';

<MarginNote label="作者补记" note="只补充与这句判断相关的解释。">

保留所评论的原文；真实引文另加准确出处。

</MarginNote>

<Pinyin text="太虚" pinyin="tài xū" />

<Tool title="计算器" description="输入数字和运算符；回车计算。" collapsible defaultOpen={false}>
  <Calculator />
</Tool>
```

`Pinyin` 按字符与空格分隔的拼音逐项配对，不会自动查读音。标点也占字符位置；含标点时分开注音片段。优先直接给正确的调号拼音，数量必须匹配。`yinbiao` 支持数字、中文声调名、符号、英文声调名；`tones` 为 `auto`、`symbol`、`number`。现有 `number` 模式不会去除已转换的调号，`yinbiao` 也不完整覆盖已有调号，复杂组合先预览，不能只凭名称推断效果。

`Tool` 支持 `title`、`description`、`collapsible`、`defaultOpen` 和 `class`。折叠按钮依赖存在标题或说明，不能同时省略二者又把工具默认关闭。折叠仅收起内容，脚本仍会加载；不能称为按展开才初始化。长内容打开后最多 5000px，长代码说明优先用 `details`。

`Calculator` 支持四则运算、百分比、退格、清空与键盘。标题与说明仍需讲清工具和本节内容的关系。新增工具属于开发工作，需独立验证交互和多实例。

正文不嵌入 `Tabs`、`Search`、`TOCResponsive`、`SeriesTOC`、布局组件或视频的 `Base` 外壳；这些属于站点骨架/内部复用。

## 视频、图片与附件

依据：`src/component/video/youtube.astro`、`bilibili.astro`、`base.astro`、`src/lib/lazy-video.ts`、`figure.astro`、`attachment.astro` 与 ADR-0005。

- `YouTube`：必填 `id`，可选 `title`。传真实视频 ID，不传完整 URL；正常 ID 通常 11 位，当前代码接受 6–20 位字母数字、下划线和短横线，不证明视频存在。没有 `poster` prop。
- `Bilibili`：传 `bvid`，或同时传数字 `aid`/`cid`；可选 `title`、`poster`。使用真实来源，并提供有意义的封面；默认是站点占位图，不能把它当作成稿配图。
- 视频为 16:9，点击后才创建 iframe；不能自托管 mp4 或改成自动加载 iframe。YouTube 封面仍可能在点击前向图片域名发请求，“点击才加载”针对播放器，不能写成完全没有第三方请求。
- `Figure`：必填 `src`、`alt`，可选 `caption`、`full`（默认 `true`）。当前仅输出原生 `<img loading="lazy" decoding="async">`，不会自动压缩、生成多尺寸或转 WebP；要走 Astro 图片管线需另行选择和验证实现。
- 为图片提供真实、能解释正文的素材和描述；图注交代读者应该看哪里。普通 Markdown 图片与 `Figure` 不是同一管线，不能假定全部图片都懒加载或自动优化。
- `Attachment`：必填 `href`、`name`，可选 `size`、`ext`、`note`。本地 `/downloads/...` 来自 `public/downloads/`，链接有下载属性；HTTP(S) 外链在新标签打开，不保证直接下载。`size` 只是显示文字，不会测量文件。
- 小附件约 10MB 内随站托管，大附件用对象存储/CDN 或 GitHub Release；确认文件真实存在。站点内链接从根路径写起，不带旧 `/nothingness` 前缀。

新增网站图片遵守当前会话的图片来源规则；此参考只描述组件能力，不替代更高优先级的资源来源约束。若用户未给足配图信息，可先完成文字，不用无关占位图填满文章。

## 发布与可发现性

依据：`src/content.ts`、`src/pages/index.astro`、`search-index.json.ts`、`rss.xml.ts`、`llms.txt.ts`、`llms-full.txt.ts`、`astro.config.mjs`。

本地开发展示草稿，生产构建过滤草稿。生产首页、路由、标签、搜索、RSS、sitemap 与 LLM 输出依赖同一内容出口。设置未来 `date` 不会定时发布，过滤条件只看 `draft`。

搜索匹配标题、描述和标签，不搜全文。RSS 收录单篇和集合，子项没有各自的 RSS 条目。`llms-full.txt` 包括公开子项，但输出原始 MDX（含 imports 和组件标签），不把注音或工具变成普通文字。写作时给核心解释保留自然语言。

`npm run build` 做 Astro 检查与静态构建；草稿不生成页面，需要另开开发预览检查草稿正文。构建成功不能证明外链可访问、图片有意义或技术观点正确。发布还需要明确将草稿转正式并部署，这与整理内容是不同动作。
