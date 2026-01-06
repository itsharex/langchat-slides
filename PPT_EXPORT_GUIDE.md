# PPT 导出功能实现指南

## 功能概述

已为项目添加了 PPT (.pptx) 导出功能，允许用户将 Infographic 渲染的 SVG 幻灯片导出为 PowerPoint 演示文稿。

## 技术方案

### 使用库：PptxGenJS

- **纯前端实现**：无需后端服务
- **成熟稳定**：广泛使用的前端 PPT 生成库
- **TypeScript 支持**：良好的类型定义

### 实现原理

由于 PptxGenJS 不直接支持 SVG 插入，采用以下两步策略：

1. **SVG 转 PNG**：使用 `@antv/infographic` 的 `toDataURL({ type: 'png' })` 方法将 SVG 转换为 PNG 图片
2. **PNG 插入 PPT**：使用 PptxGenJS 创建 16:9 比例的幻灯片，并将 PNG 图片铺满整个幻灯片

## 安装依赖

在项目根目录运行以下命令安装 PptxGenJS：

```bash
# 使用 pnpm（推荐）
pnpm add pptxgenjs

# 或使用 npm
npm install pptxgenjs
```

## 修改的文件

### 1. src/components/slides/SlidePreview.vue

**修改内容：**
- 导入 PptxGenJS 库
- 添加 `pptx` 格式的导出处理逻辑

**核心代码：**
```typescript
import PptxGenJS from 'pptxgenjs'

// 在导出处理中添加
else if (format === 'pptx') {
  const dataUrl = await store.infographic.toDataURL({ type: 'png' })
  const img = new Image()
  img.src = dataUrl
  await new Promise(resolve => img.onload = resolve)
  
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'  // 设置为 16:9 比例
  
  const slide = pptx.addSlide()
  slide.addImage({
    data: dataUrl,
    x: 0,
    y: 0,
    w: '100%',
    h: '100%'
  })
  
  await pptx.writeFile({ fileName: filename })
}
```

### 2. src/components/slides/SlidesHeader.vue

**修改内容：**
- 导入 `Presentation` 图标
- 在导出下拉菜单中添加 PPT 选项

**核心代码：**
```typescript
import { Presentation } from 'lucide-vue-next'

// 在导出下拉菜单中添加
<DropdownMenuItem class="cursor-pointer" @click="store.triggerExport('pptx')">
  <div class="flex items-center gap-2">
    <Presentation class="h-3.5 w-3.5 text-muted-foreground" />
    <span>{{ t('exportPpt').value }}</span>
  </div>
</DropdownMenuItem>
```

### 3. src/locales/zh.json

**添加的国际化文本：**
```json
"exportPpt": "PPT 演示文稿"
```

### 4. src/locales/en.json

**添加的国际化文本：**
```json
"exportPpt": "PPT Presentation"
```

## 使用方法

1. **安装依赖**：运行 `pnpm add pptxgenjs` 安装 PptxGenJS
2. **启动项目**：运行 `pnpm dev` 启动开发服务器
3. **生成幻灯片**：通过 AI 生成或手动创建幻灯片
4. **导出 PPT**：
   - 点击顶部的"导出"按钮
   - 选择"PPT 演示文稿"选项
   - 等待导出完成，自动下载 `.pptx` 文件

## 功能特点

- ✅ **16:9 标准比例**：与幻灯片尺寸（1280x720）完美匹配
- ✅ **高清导出**：基于 PNG 转换，保持图像质量
- ✅ **纯前端实现**：无需后端服务，快速响应
- ✅ **多语言支持**：中英文界面
- ✅ **统一风格**：与其他导出格式（PNG、SVG、PDF）保持一致的用户体验

## 注意事项

1. **依赖安装**：确保已安装 PptxGenJS，否则导出功能会报错
2. **文件大小**：由于将 SVG 转换为 PNG，生成的 PPT 文件可能比 SVG 大
3. **编辑性**：导出的 PPT 中的内容为图片，无法直接编辑文字和图形
4. **浏览器兼容性**：现代浏览器均支持，建议使用 Chrome、Firefox、Edge 或 Safari 最新版本

## 可能的改进方向

如果需要更好的编辑性，可以考虑以下方案：

1. **SVG 直接转 PPT**：使用支持 SVG 矢量导入的库（如 `svg2pptx`）
2. **后端处理**：使用 Python 的 `python-pptx` 或 Node.js 的后端服务
3. **多层导出**：将文本、图形等元素分别导出为可编辑的 PPT 元素

## 故障排除

### 导出失败

**问题**：点击导出按钮后没有反应或报错

**解决方案**：
1. 检查浏览器控制台是否有错误信息
2. 确认已安装 PptxGenJS 依赖
3. 确认幻灯片已正确渲染

### 导出的 PPT 打开失败

**问题**：下载的 `.pptx` 文件无法打开

**解决方案**：
1. 检查文件是否完整下载
2. 尝试用不同的 PowerPoint 版本或兼容软件打开
3. 检查浏览器控制台是否有导出错误

### 图片质量不佳

**问题**：导出的 PPT 中图片模糊

**解决方案**：
1. 增加导出时的图片分辨率（修改代码中的图片尺寸）
2. 在 PowerPoint 中查看时选择适当的缩放级别

## 技术支持

如有问题，请查看：
- PptxGenJS 官方文档：https://gitbrent.github.io/PptxGenJS/
- AntV Infographic 文档：https://antv.antgroup.com/infographic
- 项目 GitHub 仓库
