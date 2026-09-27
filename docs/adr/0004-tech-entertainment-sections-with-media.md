# 首页分区为「技术 / 娱乐」，内容集合命名为 series 与 entertainment

首页第二个分区由「小说」改为「娱乐」。娱乐是与「技术」并列的**聚合分区**，不是单个集合。

**决定**：

- `series` 集合（URL `/series/<slug>`）：外表一张卡、内部由 `chapters` 子项组成的集合类内容（如连载小说）。落地页与子项页沿用双栏布局，目录只来自 chapters 集合。
- `entertainment` 集合（URL `/entertainment/<slug>`）：娱乐分区的单篇内容，包括随笔与以第三方视频、图片、附件为主体的条目，复用与技术文相同的正文布局。
- 首页「娱乐」标签聚合 `series` + `entertainment`；技术标签只显示 `tech`。
- 搜索、标签聚合、sitemap、RSS、llms.txt 全部纳入 `series` 与 `entertainment`。

**命名沿革**：早期实现用过 `novel`（含 `isNovel`/`novelSlug` 区分小说与随笔）与 `media`。因「小说」只是集合的一种、media 偏实现而非内容性质，统一改名为 `series` 与 `entertainment`，URL 也由 `/novel/`、`/media/` 迁移为 `/series/`、`/entertainment/`。随笔不再需要布尔标记，直接放 entertainment。
