import { ref } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useAI } from '@/api/ai'
import { useThrottleFn } from '@vueuse/core'
import type { Slide } from '@/types'

export function useSlideGenerator() {
  const store = useAppStore()
  const { streamChat } = useAI()

  const selectedTheme = ref('')
  const pageCount = ref(1)
  const currentEditingPage = ref(0)

  // 移除markdown代码块标记
  function cleanMarkdownCode(content: string): string {
    // 移除开头的 ```md, ```markdown, ```plain 等
    let cleaned = content.replace(/^```\w*\n?/m, '')
    // 移除结尾的 ```
    cleaned = cleaned.replace(/\n?```$/, '')
    return cleaned
  }

  // Throttle updates to avoid excessive re-renders
  const throttledUpdate = useThrottleFn((content: string, pageIndex: number) => {
    updateSlideCode(content, pageIndex)
  }, 100)

  async function generateSlides(prompt: string, theme: string, totalPages: number) {
    store.isStreaming = true

    try {
      const config = {
        apiKey: store.apiKey,
        baseUrl: store.baseUrl,
        model: store.model
      }

      // 为每一页生成内容
      for (let page = 1; page <= totalPages; page++) {
        const pagePrompt = `请为第 ${page} 页（共 ${totalPages} 页）生成幻灯片内容。${prompt}\n\n注意：只输出这一页的内容，不要包含其他页面的内容。\n\n格式要求：第一行必须是 infographic 模板名称（例如：infographic list-horizontal-icon-arrow），然后换行输入 data 及其内容。不要使用 [slide] 和 [/slide] 标签。也不要使用 markdown 代码块标记。`

        // 添加页码提示到消息中
        const pageMessages = [
          { role: 'user', content: pagePrompt }
        ]

        const stream = streamChat(pageMessages, config, theme)
        let pageContent = ''

        for await (const chunk of stream) {
          pageContent += chunk
          
          // 移除markdown代码块标记
          const cleanedContent = cleanMarkdownCode(pageContent)
          
          // 实时更新当前页的幻灯片内容
          throttledUpdate(cleanedContent, page)
          
          // 切换到当前页
          store.currentSlideIndex = page - 1
          currentEditingPage.value = page - 1
        }

        // 最终解析并创建幻灯片
        parseSingleSlide(pageContent, page)
      }
    } catch (error: any) {
      console.error('Stream error:', error)
      throw error
    } finally {
      store.isStreaming = false
    }
  }

  function parseSingleSlide(content: string, pageIndex: number) {
    // 直接使用整个内容作为幻灯片语法（不再使用[slide]标签）
    // 移除markdown代码块标记
    const slideBody = cleanMarkdownCode(content).trim()
    
    if (slideBody && slideBody.length > 5) {
      const slide: Slide = {
        id: `slide-${pageIndex}`,
        content: slideBody,
        syntax: slideBody,
        title: store.infographic?.getOptions().data?.title || undefined
      }

      // 添加到幻灯片列表
      if (pageIndex === 1) {
        store.setSlides([slide])
      } else {
        store.appendSlides([slide])
      }
      
      // 切换到最新生成的幻灯片
      store.currentSlideIndex = store.slides.length - 1
      currentEditingPage.value = store.currentSlideIndex
    }
  }

  function updateSlideCode(content: string, pageIndex: number) {
    // 更新指定页的幻灯片内容
    const slideBody = content.trim()
    
    if (slideBody && slideBody.length > 5) {
      const slideIndex = pageIndex - 1
      
      // 如果幻灯片不存在，创建新的
      if (!store.slides[slideIndex]) {
        const slide: Slide = {
          id: `slide-${pageIndex}`,
          content: slideBody,
          syntax: slideBody,
          title: ''
        }
        store.setSlides([...store.slides, slide])
      } else {
        // 更新现有幻灯片
        store.slides[slideIndex].syntax = slideBody
        store.slides[slideIndex].content = slideBody
      }
    }
  }

  function handleSend() {
    if (!store.inputPrompt.trim() || store.isStreaming) return
    
    // 清空现有幻灯片
    store.clearSlides()
    
    // 根据页码数量分批生成
    generateSlides(store.inputPrompt, selectedTheme.value, pageCount.value)
    store.inputPrompt = ''
  }

  return {
    selectedTheme,
    pageCount,
    currentEditingPage,
    generateSlides,
    handleSend
  }
}
