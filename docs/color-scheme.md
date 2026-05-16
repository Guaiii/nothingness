# 配色方案文档

> 本文档描述 nothingness 项目的完整配色体系。
> 所有颜色变量定义在 `src/styles/color-scheme.css`，`global.css` 已导入该文件，旧变量名保留为别名以确保向后兼容。

---

## 主色（Primary）

| 变量名 | 用途 | Hex | RGB | HSL |
|--------|------|-----|-----|-----|
| `--color-primary` / `--var_red` | 主强调色、链接、按钮 | `#9b1b30` | rgb(155,27,48) | hsl(350,70%,36%) |
| `--color-primary-light` | hover 状态 | `#c92a42` | rgb(201,42,66) | hsl(350,65%,48%) |
| `--color-primary-lighter` | 浅底背景 | `#e84d64` | rgb(232,77,100) | hsl(350,77%,61%) |
| `--color-primary-lightest` | 最浅底 | `#f5e6e9` | rgb(245,230,233) | hsl(348,43%,93%) |
| `--color-primary-dark` | 活跃/按下态 | `#7a1525` | rgb(122,21,37) | hsl(350,71%,28%) |
| `--color-primary-darker` | 深背景文字 | `#5a0f1b` | rgb(90,15,27) | hsl(350,71%,21%) |
| `--color-primary-darkest` | 最深强调 | `#3a0911` | rgb(58,9,17) | hsl(350,73%,13%) |

**主色透明度变体**

| 变量名 | 值 |
|--------|-----|
| `--color-primary-alpha-10` | rgba(155,27,48,0.1) |
| `--color-primary-alpha-20` | rgba(155,27,48,0.2) |
| `--color-primary-alpha-30` | rgba(155,27,48,0.3) |

---

## 背景色（Background）

| 变量名 | 用途 | Hex | RGB |
|--------|------|-----|-----|
| `--color-background` / `--var_background-color` | 页面主背景 | `#ebe6da` | rgb(235,230,218) |
| `--color-background-light` | 卡片/面板背景 | `#f0ece3` | rgb(240,236,227) |
| `--color-background-lighter` | 悬浮层背景 | `#f5f2ec` | rgb(245,242,236) |
| `--color-background-lightest` | 最高层背景 | `#faf8f5` | rgb(250,248,245) |
| `--color-background-dark` | 深色面板 | `#d4cfc4` | rgb(212,207,196) |
| `--color-background-darker` | 边框/分割线附近 | `#bdb8ac` | rgb(189,184,172) |
| `--color-background-darkest` | 最深背景辅助 | `#a69f91` | rgb(166,159,145) |

---

## 米白色（Off-White）

| 变量名 | 用途 | Hex | RGB |
|--------|------|-----|-----|
| `--color-off-white` / `--var_off-white` | 头部/导航文字背景 | `#f5f5dc` | rgb(245,245,220) |
| `--color-off-white-light` | 浅底辅助 | `#f7f7e8` | rgb(247,247,232) |
| `--color-off-white-lighter` | 更浅辅助 | `#fafaf0` | rgb(250,250,240) |
| `--color-off-white-lightest` | 最浅辅助 | `#ffffff` | rgb(255,255,255) |
| `--color-off-white-dark` | 深于基色的分隔 | `#e8e8c8` | rgb(232,232,200) |
| `--color-off-white-darker` | 更深的米白 | `#d0d0b0` | rgb(208,208,176) |
| `--color-off-white-darkest` | 最深米白 | `#b8b898` | rgb(184,184,152) |

---

## 文字色（Text）

| 变量名 | 用途 | Hex | RGB |
|--------|------|-----|-----|
| `--color-text` / `--var_pitch-black` | 主文字色 | `#333333` | rgb(51,51,51) |
| `--color-text-light` | 次要文字 | `#444444` | rgb(68,68,68) |
| `--color-text-lighter` | 辅助文字 | `#555555` | rgb(85,85,85) |
| `--color-text-lightest` | 占位/禁用文字 | `#666666` | rgb(102,102,102) |
| `--color-text-dark` | 强调文字（近黑） | `#1a1a1a` | rgb(26,26,26) |
| `--color-text-darker` | 更深强调 | `#0d0d0d` | rgb(13,13,13) |
| `--color-text-darkest` | 纯黑 | `#000000` | rgb(0,0,0) |

---

## 边框色（Border）

| 变量名 | 用途 | Hex | RGB |
|--------|------|-----|-----|
| `--color-border` / `--var_border-color` | 主边框 | `#b5b5b5` | rgb(181,181,181) |
| `--color-border-light` | 浅边框/分割线 | `#b8b8b8` | rgb(184,184,184) |
| `--color-border-lighter` | 更浅边框 | `#cccccc` | rgb(204,204,204) |
| `--color-border-lightest` | 最浅边框 | `#e0e0e0` | rgb(224,224,224) |
| `--color-border-dark` | 深边框 | `#8a8a8a` | rgb(138,138,138) |
| `--color-border-darker` | 更深边框 | `#666666` | rgb(102,102,102) |
| `--color-border-darkest` | 最深边框 | `#404040` | rgb(64,64,64) |

---

## 棕色系（Brown / Tone Colors）

用于拼音声调标注和代码语法高亮：

| 变量名 | 用途 | Hex |
|--------|------|------|
| `--color-tone-1` | 阴平（一声）| `#d32f2f` |
| `--color-tone-2` | 阳平（二声）| `#f57c00` |
| `--color-tone-3` | 上声（三声）| `#388e3c` |
| `--color-tone-4` | 去声（四声）| `#1976d2` |
| `--color-tone-0` | 轻声 | `#757575` |
| `--color-brown` | 普通棕色 | `#8b7355` |
| `--color-brown-dark` | 深棕色 | `#6b5b3d` |
| `--color-brown-darker` | 更深棕色 | `#8b4513` |
| `--color-gold` | 金色（函数名高亮）| `#704214` |

---

## 语义色（Semantic）

| 语义 | 变量名 | Hex | 用途 |
|------|--------|-----|------|
| 成功 | `--color-success` / `--color-success-border` | `#198754` | 完成状态、成功提示 |
| 成功背景 | `--color-success-bg` | rgba(25,135,84,0.1) | 成功提示背景 |
| 警告 | `--color-warning` / `--color-warning-border` | `#ffc107` | 警告提示 |
| 警告背景 | `--color-warning-bg` | rgba(255,193,7,0.1) | 警告提示背景 |
| 信息 | `--color-info` / `--color-info-border` | `#0d6efd` | 信息提示 |
| 信息背景 | `--color-info-bg` | rgba(13,110,253,0.1) | 信息提示背景 |
| 重要 | `--color-important` / `--color-important-border` | `#9b1b30` | 同主色 |
| 重要背景 | `--color-important-bg` | rgba(155,27,48,0.1) | 重要提示背景 |

---

## 代码语言标签色（Lang Badges）

| 语言 | 背景 | 文字 |
|------|------|------|
| JS | `#f7df1e` (`--color-lang-js`) | `#000` (`--color-lang-js-text`) |
| TS | `#3178c6` (`--color-lang-ts`) | `#fff` (`--color-lang-ts-text`) |
| CSS | `#1572b6` (`--color-lang-css`) | `#fff` |
| HTML | `#e34f26` (`--color-lang-html`) | `#fff` |
| JSON | `#000000` (`--color-lang-json`) | `#fff` |
| Bash | `#4eaa25` (`--color-lang-bash`) | `#fff` |

---

## 遮罩层（Overlay）

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--overlay-dark` | rgba(0,0,0,0.9) | 搜索面板遮罩 |
| `--overlay-light` | rgba(0,0,0,0.5) | TOC 移动端遮罩 |
| `--overlay-lighter` | rgba(0,0,0,0.05) | 浅色悬浮 |

---

## 使用指南

1. **优先使用 CSS 变量**，不要硬编码颜色值
2. **主色** `--color-primary` 用于所有强调、链接、按钮
3. **背景色** `--color-background` 用于页面底，`--color-off-white` 用于头部/面板底
4. **语义色** 用于 `.warning` / `.note` / `.tip` / `.important` 等提示框
5. 扩展色板（light/dark 变体）用于 hover/active/disabled 等状态

---

## 迁移说明

旧变量名已保留为别名，定义在 `src/styles/color-scheme.css` 末尾：

```css
--var_red: var(--color-primary);
--var_background-color: var(--color-background);
--var_border-color: var(--color-border);
--var_off-white: var(--color-off-white);
--var_pitch-black: var(--color-text);
```

现有代码无需修改即可继续工作。
