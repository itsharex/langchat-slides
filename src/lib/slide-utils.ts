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
