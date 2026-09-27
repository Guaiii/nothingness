# 统一内容契约：frontmatter、草稿出口、章节集合与可嵌入组件

**决定**：

- 技术文与作品共用核心 frontmatter：`title`、`description`、`tags`、`date`、`updated`（可选）、`author`（可选）、`draft`（默认 false）、`cover`（可选）；小说另加 `status` 与 `chapters`。
- 草稿通过 `draft: true` 标记，仅在本地开发可见；生产构建在“集合加载”这一处统一出口过滤草稿，草稿不进页面、sitemap 或搜索。发布即去除 `draft` 并重新部署。
- 将目前游离（未注册、章节页只渲染占位文字）的章节注册为正式内容，让章节页真正渲染章节正文并接通上一章/下一章导航。
- 正文允许嵌入的组件 allow-list：`Tool`、`Calculator`（及 `tools/` 下挂在 Tool 内的工具）、`Pinyin`、`Quote`。`Tabs`、`Search`、`TOCResponsive`、`NovelTOC` 属于页面骨架，不得作为正文块嵌入。

原因：现有 schema 只声明了 `title/tags`，但实际 MDX 已在使用 `date/description`，schema 与内容不一致；章节是未完成的半成品；统一集合加载出口同时落实架构评审候选①（内容目录与站点路径收束），使路径规则、草稿过滤各只有一处。
