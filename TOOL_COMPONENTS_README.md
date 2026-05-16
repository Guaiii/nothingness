# Tool 组件使用指南

## 概述

通用 Tool 组件为 Astro + MDX 项目提供了统一的工具嵌入功能。所有交互式小工具都可以使用 Tool 组件作为容器，确保视觉风格统一。

## 文件结构

```
src/
├── component/
│   ├── tool.astro              # 通用 Tool 容器组件
│   └── tools/
│       └── calculator.astro    # 示例：计算器工具
└── content/
    └── tech/
        └── tool-demo.mdx      # 使用示例文档
```

## Tool 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `""` | 工具的标题 |
| `description` | `string` | `""` | 工具的描述文字 |
| `collapsible` | `boolean` | `false` | 是否可折叠 |
| `defaultOpen` | `boolean` | `true` | 初始状态是否展开（仅当 collapsible=true 时有效） |
| `class` | `string` | `""` | 自定义 CSS 类名 |

## 基本用法

### 1. 在 MDX 文件中使用

```astro
---
title: "我的文章"
---

import Tool from '../../component/tool.astro';
import Calculator from '../../component/tools/calculator.astro';

# 我的文章

<Tool title="计算器" description="一个简单的小工具">
  <Calculator />
</Tool>
```

### 2. 可折叠工具

```astro
<Tool 
  title="可折叠工具" 
  description="点击右上角按钮折叠/展开"
  collapsible 
  defaultOpen={false}
>
  <Calculator />
</Tool>
```

### 3. 不带标题的工具

```astro
<Tool>
  <Calculator />
</Tool>
```

### 4. 自定义样式

```astro
<Tool 
  title="自定义工具" 
  class="my-custom-class"
>
  <div>你的工具内容</div>
</Tool>
```

## 创建新工具

### 步骤 1：创建工具组件

在 `src/component/tools/` 目录下创建新的 `.astro` 文件：

```astro
---
// src/component/tools/my-tool.astro
---

<div class="my-tool">
  <h3>我的工具</h3>
  <p>工具内容...</p>
</div>

<script>
  // 客户端交互逻辑
  document.querySelectorAll('.my-tool button').forEach(btn => {
    btn.addEventListener('click', () => {
      // 处理逻辑
    });
  });
</script>

<style scoped>
  .my-tool {
    /* 使用项目 CSS 变量确保风格统一 */
    background-color: var(--var_background-color);
    border: var(--var_border-width) solid var(--var_border-color);
    color: var(--var_pitch-black);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .my-tool {
      padding: 0.75rem;
    }
  }
</style>
```

### 步骤 2：在 MDX 中使用

```astro
---
title: "使用我的工具"
---

import Tool from '../../component/tool.astro';
import MyTool from '../../component/tools/my-tool.astro';

<Tool title="我的工具" description="工具描述">
  <MyTool />
</Tool>
```

## 样式指南

### CSS 变量

Tool 组件和工具组件应使用项目统一的 CSS 变量：

```css
--var_background-color: #ebe6da;  /* 背景色 */
--var_border-color: #b5b5b5;      /* 边框颜色 */
--var_off-white: #f5f5dc;         /* 米白色 */
--var_red: #9b1b30;               /* 主题红色 */
--var_pitch-black: #333333;       /* 墨黑色 */
--var_border-width: 0.1rem;       /* 边框宽度 */
```

### 响应式断点

- **桌面端**: > 768px
- **平板端**: ≤ 768px
- **移动端**: ≤ 480px

### 样式隔离

- 使用 Astro 的 `scoped` 样式：`<style scoped>`
- 或者给组件添加命名空间前缀：`tool-`, `calc-` 等

## 示例：计算器工具

计算器工具展示了如何创建一个完整的交互式工具：

### 功能特性

- ✅ 基础四则运算（加、减、乘、除）
- ✅ 百分比计算
- ✅ 退格功能
- ✅ 键盘支持（数字键、运算符、Enter、Escape、Backspace）
- ✅ 响应式设计
- ✅ 无障碍支持（aria-label）

### 键盘快捷键

- `0-9`: 输入数字
- `+`, `-`, `*`, `/`: 运算符
- `Enter` 或 `=`: 计算结果
- `Escape`: 清除
- `Backspace`: 退格

## 最佳实践

### 1. 组件设计

- 保持工具组件独立，不依赖外部状态
- 使用 `scoped` 样式避免样式冲突
- 提供清晰的 API（Props）

### 2. 客户端脚本

- 使用 `<script>` 标签包裹客户端逻辑
- 避免使用 `document.getElementById`（可能重复 ID），改用 `querySelector` 和类名
- 在脚本中添加类型注解（TypeScript）

### 3. 无障碍性

- 为交互元素添加 `aria-label`
- 为可折叠元素添加 `aria-expanded`
- 确保键盘导航可用

### 4. 性能优化

- 避免在工具中加载大型库
- 使用事件委托减少事件监听器数量
- 延迟初始化非关键功能

## 常见问题

### Q: 如何在工具中访问 Astro 的 props？

A: 工具的客户端脚本运行在浏览器中，无法访问 Astro 的 props。如果需要根据 props 改变行为，可以在组件渲染时生成不同的 HTML 结构或 data 属性。

### Q: 工具组件可以在多个页面中使用吗？

A: 可以。每个工具组件都是独立的，可以在任意 MDX 文件中导入和使用。

### Q: 如何调试客户端脚本？

A: 在浏览器开发者工具的 Console 中查看错误信息，使用 `console.log` 调试。

## 示例文件

- **Tool 组件**: `src/component/tool.astro`
- **计算器示例**: `src/component/tools/calculator.astro`
- **使用文档**: `src/content/tech/tool-demo.mdx`

## 更新日志

### 2024-05-16
- ✅ 创建通用 Tool 容器组件
- ✅ 实现可折叠功能
- ✅ 创建计算器示例工具
- ✅ 编写使用文档
- ✅ 实现响应式设计
- ✅ 添加键盘支持
- ✅ 确保样式隔离

## 许可证

与项目主许可证一致。
