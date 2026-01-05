export interface ThemeState {
  currentTheme: string
  sketchStyle: boolean
  currentPalette: string
  customPalette: string[]
  palettes: { name: string; colors: string[] }[]
}

export function applyThemeToSyntax(syntax: string, state: ThemeState): string {
  let lines = syntax.split('\n')
  
  // Remove existing theme block (multi-line format)
  // Example:
  // theme
  //   palette #10b981 #f59e0b #3b82f6 #ef4444
  let themeBlockIndex = -1
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    // Find 'theme' line that is followed by indented content
    if (trimmedLine === 'theme' || trimmedLine === 'theme:') {
      const nextLine = lines[index + 1]
      if (nextLine && nextLine.trim().startsWith('palette')) {
        themeBlockIndex = index
      }
    }
  })
  
  // Remove entire theme block (theme line and its indented palette line)
  if (themeBlockIndex !== -1) {
    lines.splice(themeBlockIndex, 2)
  }
  
  // Also remove inline theme and palette lines
  // Example: "theme hand-drawn" or "palette business"
  // Remove any line that starts with "theme " or "palette "
  lines = lines.filter((line, index) => {
    const trimmedLine = line.trim()
    // Keep lines that don't start with "theme " or "palette "
    // But keep standalone "theme" line (we'll handle it separately)
    return !trimmedLine.startsWith('theme ') && !trimmedLine.startsWith('palette ')
  })
  
  // Re-find infographic line after removing lines
  const infographicLineIndex = lines.findIndex(line => line.trim().startsWith('infographic'))
  
  // Build theme args
  let themeArgs: string[] = []
  if (state.sketchStyle) {
    themeArgs.push('hand-drawn')
  }
  if (state.currentTheme === 'dark') {
    themeArgs.push('dark')
  }
  
  // Build palette args
  let paletteArgs: string[] = []
  if (state.currentPalette === 'custom') {
    paletteArgs = state.customPalette
  } else {
    const p = state.palettes.find(p => p.name === state.currentPalette)
    if (p) paletteArgs = p.colors
  }
  
  // Construct the new theme/palette block
  if (infographicLineIndex !== -1 && (themeArgs.length > 0 || paletteArgs.length > 0)) {
    const themeLine = `theme${themeArgs.length > 0 ? ' ' + themeArgs.join(' ') : ''}`
    
    // Insert theme line
    lines.splice(infographicLineIndex + 1, 0, themeLine)
    
    // Insert palette line (indented) if we have colors
    if (paletteArgs.length > 0) {
      lines.splice(infographicLineIndex + 2, 0, `  palette ${paletteArgs.join(' ')}`)
    }
  }
  
  return lines.join('\n')
}

export const infographicTemplates = [
  // 序列类模板
  {
    label: '锯齿步骤下划线文本序列',
    value: 'sequence-zigzag-steps-underline-text',
  },
  {
    label: '水平锯齿下划线文本序列',
    value: 'sequence-horizontal-zigzag-underline-text',
  },
  {
    label: '水平锯齿简单插图序列',
    value: 'sequence-horizontal-zigzag-simple-illus',
  },
  { label: '简单圆形序列', value: 'sequence-circular-simple' },
  { label: '简单过滤网格序列', value: 'sequence-filter-mesh-simple' },
  { label: '山形下划线文本序列', value: 'sequence-mountain-underline-text' },
  { label: '简单3D圆柱序列', value: 'sequence-cylinders-3d-simple' },
  {
    label: '彩色蛇形步骤水平图标线序列',
    value: 'sequence-color-snake-steps-horizontal-icon-line',
  },
  { label: '简单金字塔序列', value: 'sequence-pyramid-simple' },
  { label: '简单垂直路线图', value: 'sequence-roadmap-vertical-simple' },
  {
    label: '简单垂直纯文本路线图',
    value: 'sequence-roadmap-vertical-plain-text',
  },
  { label: '简单3D锯齿圆盘序列', value: 'sequence-zigzag-pucks-3d-simple' },
  { label: '简单上升步骤', value: 'sequence-ascending-steps' },
  {
    label: '简单3D上升楼梯下划线文本',
    value: 'sequence-ascending-stairs-3d-underline-text',
  },
  { label: '紧凑卡片蛇形步骤', value: 'sequence-snake-steps-compact-card' },
  { label: '下划线文本蛇形步骤', value: 'sequence-snake-steps-underline-text' },
  { label: '简单蛇形步骤', value: 'sequence-snake-steps-simple' },
  { label: '紧凑卡片前向楼梯', value: 'sequence-stairs-front-compact-card' },
  { label: '圆角标签前向楼梯', value: 'sequence-stairs-front-pill-badge' },
  { label: '简单时间线', value: 'sequence-timeline-simple' },
  { label: '圆角矩形节点时间线', value: 'sequence-timeline-rounded-rect-node' },
  { label: '简单插图时间线', value: 'sequence-timeline-simple-illus' },

  // 对比类模板
  {
    label: '简单折叠水平二元对比',
    value: 'compare-binary-horizontal-simple-fold',
  },
  {
    label: '左右圆形节点圆角标签层次对比',
    value: 'compare-hierarchy-left-right-circle-node-pill-badge',
  },
  { label: 'SWOT分析对比', value: 'compare-swot' },
  {
    label: '圆角标签卡片四象限',
    value: 'compare-binary-horizontal-badge-card-arrow',
  },
  {
    label: 'VS下划线文本水平二元对比',
    value: 'compare-binary-horizontal-underline-text-vs',
  },

  // 象限类模板
  { label: '简单卡片四分象限', value: 'quadrant-quarter-simple-card' },
  { label: '圆形四分象限', value: 'quadrant-quarter-circular' },
  { label: '简单插图象限', value: 'quadrant-simple-illus' },

  // 关系类模板
  { label: '圆形图标标签关系', value: 'relation-circle-icon-badge' },
  { label: '圆形进度关系', value: 'relation-circle-circular-progress' },

  // 层次类模板
  {
    label: '科技风格胶囊项目层次树',
    value: 'hierarchy-tree-tech-style-capsule-item',
  },
  {
    label: '曲线连接圆角矩形节点层次树',
    value: 'hierarchy-tree-curved-line-rounded-rect-node',
  },
  {
    label: '科技风格圆角标签卡片层次树',
    value: 'hierarchy-tree-tech-style-badge-card',
  },

  // 图表类模板
  { label: '简单柱状图', value: 'chart-column-simple' },
  { label: '纯文本条形图', value: 'chart-bar-plain-text' },
  { label: '纯文本折线图', value: 'chart-line-plain-text' },
  { label: '纯文本饼图', value: 'chart-pie-plain-text' },
  { label: '紧凑卡片饼图', value: 'chart-pie-compact-card' },
  { label: '纯文本圆环饼图', value: 'chart-pie-donut-plain-text' },
  { label: '圆角标签圆环饼图', value: 'chart-pie-donut-pill-badge' },
  { label: '词云图', value: 'chart-wordcloud' },

  // 列表类模板
  { label: '圆角标签卡片网格列表', value: 'list-grid-badge-card' },
  { label: '糖果卡片轻量网格列表', value: 'list-grid-candy-card-lite' },
  { label: '彩带卡片网格列表', value: 'list-grid-ribbon-card' },
  { label: '水平图标箭头行列表', value: 'list-row-horizontal-icon-arrow' },
  { label: '简单插图行列表', value: 'list-row-simple-illus' },
  { label: '纯文本扇形列表', value: 'list-sector-plain-text' },
  { label: '完成列表列', value: 'list-column-done-list' },
  { label: '垂直图标箭头列列表', value: 'list-column-vertical-icon-arrow' },
  { label: '简单垂直箭头列列表', value: 'list-column-simple-vertical-arrow' },
  { label: '紧凑卡片向下锯齿列表', value: 'list-zigzag-down-compact-card' },
  { label: '简单向下锯齿列表', value: 'list-zigzag-down-simple' },
  { label: '紧凑卡片向上锯齿列表', value: 'list-zigzag-up-compact-card' },
  { label: '简单向上锯齿列表', value: 'list-zigzag-up-simple' },
];