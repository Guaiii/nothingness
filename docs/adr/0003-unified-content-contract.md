# 统一内容契约：frontmatter、草稿出口、章节集合与可嵌入组件

**决定**：

- 技术文与作品共用核心 frontmatter：`title`、`description`、`tags`、`date`、`updated`（可选）、`author`（可选）、`draft`（默认 false）、`cover`（可选）；小说另加 `status` 与 `chapters`。
- 草稿通过 `draft: true` 标记，仅在本地开发可见；生产构建在“集合加载”这一处统一出口过滤草稿，草稿不进页面、sitemap 或搜索。发布即去除 `draft` 并重新部署。
- 将目前游离（未注册、章节页只渲染占位文字）的章节注册为正式内容，让章节页真正渲染章节正文并接通上一章/下一章导航。
- 正文允许嵌入的组件 allow-list：`Tool`、`Calculator`（及 `tools/` 下挂在 Tool 内的工具）、`Pinyin`、`Quote`，以及富媒体组件 `YouTube`、`Bilibili`、`Figure`、`Attachment`（后四者见 ADR-0004 / ADR-0005）。`Tabs`、`Search`、`TOCResponsive`、`NovelTOC` 属于页面骨架，不得作为正文块嵌入。
- 新增 `media` 集合承载富媒体单篇条目，分类与聚合规则见 ADR-0004，同样遵循本草稿与 frontmatter 契约。

原因：现有 schema 只声明了 `title/tags`，但实际 MDX 已在使用 `date/description`，schema 与内容不一致；章节是未完成的半成品；统一集合加载出口同时落实架构评审候选①（内容目录与站点路径收束），使路径规则、草稿过滤各只有一处。
