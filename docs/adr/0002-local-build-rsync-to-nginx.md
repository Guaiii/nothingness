# 本地构建并 rsync 静态产物到自有 Nginx，弃用 GitHub Pages

**决定**：在本地执行 `npm run build`，再用 `rsync over SSH` 把 `dist/` 同步到 Ubuntu 服务器的 Nginx 站点目录；使用根域名、`base: '/'`、Let's Encrypt（certbot）强制 HTTPS。GitHub 仅作代码备份，删除 GitHub Pages 自动部署 workflow。

原因：服务器只运行 Nginx，无需安装 Node 或数据库，也不承担构建内存压力，写入面不对外开放，最稳、攻击面最小；一条本地命令（构建 + rsync）链路最短、最易排错。

**已否决的方案**：服务器上 `git pull && build`（占内存、要装 Node）；push webhook 或 GitHub Actions scp（当前规模不需要的额外复杂度，日后可在不改架构的前提下追加）。

**后果**：发布依赖本机在线与 SSH 凭据；服务器本身不具备构建能力。部署目标主机/用户/目录以脚本变量或未提交的 `.env` 提供。
