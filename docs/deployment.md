# 部署到自有服务器（Nginx + HTTPS）

站点为纯静态 Astro SSG：本地构建，`rsync` 同步产物，服务器只跑 Nginx。决策背景见 `docs/adr/0002-local-build-rsync-to-nginx.md`。

## 一次性准备

1. 服务器（Ubuntu）安装 Nginx：
   ```bash
   sudo apt update && sudo apt install -y nginx rsync
   ```
2. 准备站点目录与部署用户（确保该用户对目录有写权限）：
   ```bash
   sudo mkdir -p /var/www/your-domain.com
   sudo chown -R deploy:www-data /var/www/your-domain.com
   ```
3. 域名解析：将 `your-domain.com` 与 `www.your-domain.com` 的 A 记录指向服务器 IP，放行 80/443。
4. 本机配置：
   ```bash
   cp .env.example .env   # 填写 DEPLOY_HOST / DEPLOY_USER / DEPLOY_PATH
   ```
   并把 `astro.config.mjs` 中的 `SITE_URL` 改成正式域名（canonical / sitemap / OG 依赖它）。

## 配置 Nginx 与 HTTPS

```bash
sudo cp docs/nginx.conf.example /etc/nginx/sites-available/your-domain.com
# 编辑该文件，把 your-domain.com 全部替换为正式域名、root 路径改为 DEPLOY_PATH
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

签发 Let's Encrypt 证书（自动改写配置并强制 HTTPS）：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 日常发布

```bash
npm run deploy
```

该命令先执行 `npm run build`（含 `astro check`），再用 `rsync -az --delete` 把 `dist/` 同步到服务器。先演练可运行：

```bash
DEPLOY_DRY_RUN=1 npm run deploy
```

## 写作与草稿

- 内容是仓库内的 MDX，本地 `npm run dev` 实时预览（含 Tool / Calculator / Pinyin 等嵌套组件）。
- 草稿在 frontmatter 写 `draft: true`：仅本地可见，生产构建自动排除（不进页面、sitemap、RSS、搜索）。
- 发表：去掉 `draft` 后 `npm run deploy`。删除内容走 git。

## 常见问题

- **链接带子路径或 404**：确认 `astro.config.mjs` 的 `base: "/"` 且 Nginx `root` 指向 `DEPLOY_PATH`。
- **canonical / sitemap 还是 example.com**：忘了改 `SITE_URL`，改完重新部署。
- **rsync 权限被拒**：检查部署用户对站点目录的写权限与 SSH 免密（建议配置公钥登录）。
