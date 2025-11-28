# GitHub Pages 部署配置

## 部署路径要求
- 当前配置使用 `base: '/'`，构建产物不会自动添加 `nothingness` 子路径。
- 部署到用户主页（`https://<username>.github.io/`）或自定义域名时，请保持 `base: '/'`。

## 项目主页与子路径的区别
- 用户主页或自定义域：`base: '/'`（推荐，链接形如 `/tech/xxx`）。
- 项目主页（`https://<username>.github.io/<repo>/`）：需改为 `base: '/<repo>/'`。
  - 示例：`base: '/nothingness/'`

## 修改位置
- 文件：`astro.config.mjs`
  - `site: 'https://guaiii.github.io'`
  - `base: '/'`

## 部署步骤
- 本地构建：`npm run build`
- 预览验证：`npm run preview`
- GitHub Pages：
  - 打开仓库 Settings → Pages → 选择构建源（`gh-pages` 分支或 GitHub Actions）。
  - 推荐使用默认的 Astro 构建输出目录 `dist/` 并通过 Actions 部署。

## 链接与资源
- 所有内部链接已统一为根路径（`/tech/...`, `/novel/...`, `/tags/...`）。
- 站点图标使用根路径：`/favicon.svg`。

## 常见问题
- 404：确保 Pages 配置为 `GitHub Actions` 或正确的构建目录。
- 子路径部署链接错乱：将 `base` 改为仓库名子路径并重新构建。

