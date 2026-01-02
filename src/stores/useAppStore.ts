import {defineStore} from 'pinia'
import {computed, ref, shallowRef} from 'vue'
import {useDark, useStorage, useToggle} from '@vueuse/core'
import {type Message, type Slide} from '@/types'
import {Infographic} from '@antv/infographic'

export const useAppStore = defineStore('app-store', () => {
  // --- UI State ---
  // Load default locale from environment variable
  const defaultLocale = (import.meta.env.VITE_DEFAULT_LOCALE || 'zh') as 'zh' | 'en'
  const locale = useStorage<'zh' | 'en'>('langchat-slides-locale', defaultLocale)
  
  // Defaults to Dark Mode
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
    initialValue: 'dark', // Prefer dark
  })
  const toggleDark = useToggle(isDark)

  // --- API State ---
  // Load defaults from environment variables
  const defaultApiKey = import.meta.env.VITE_OPENAI_API_KEY
  const defaultBaseUrl = import.meta.env.VITE_OPENAI_BASE_URL
  const defaultModel = import.meta.env.VITE_OPENAI_MODEL

  const apiKey = useStorage('langchat-slides-apikey-v1', defaultApiKey)
  const baseUrl = useStorage('langchat-slides-baseurl-v1', defaultBaseUrl)
  const model = useStorage('langchat-slides-model-v1', defaultModel)
  
  // --- Functional State ---
  const messages = ref<Message[]>([])
  const slides = ref<Slide[]>([])
  const currentSlideIndex = ref(0)
  const isStreaming = ref(false)
  const slideRenderMode = ref<'replace' | 'append'>('replace')
  const showCodeEditor = ref(false)
  const exportRequest = ref<{ format: 'png' | 'svg' | 'pdf' } | null>(null)
  
  // Store the Infographic instance
  const infographic = shallowRef<Infographic | null>(null)
  
  // --- Theme/Style State ---
  const currentTheme = useStorage<'default' | 'dark'>('langchat-slides-theme-v2', 'default')
  const currentPalette = useStorage<string>('langchat-slides-palette-v2', 'default')
  const sketchStyle = useStorage<boolean>('langchat-slides-sketch-v2', false)
  const customPalette = useStorage<string[]>('langchat-slides-custom-palette-v2', ['#3b82f6', '#8b5cf6', '#f97316'])

  // Predefined palettes
  const palettes = [
    { name: 'default', colors: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC'] },
    { name: 'warm', colors: ['#FF6B6B', '#FFA06B', '#FFD93D', '#FF8E72', '#FF6B9D', '#FFB6C1'] },
    { name: 'cool', colors: ['#4ECDC4', '#44A08D', '#093637', '#11998e', '#38ef7d', '#0F3443'] },
    { name: 'pastel', colors: ['#FFB5BA', '#B5DEFF', '#97F9F9', '#D9F99D', '#FEC8D8', '#E2F0CB'] },
    { name: 'neon', colors: ['#FF00FF', '#00FFFF', '#FF1493', '#7FFF00', '#FF4500', '#9400D3'] },
    { name: 'business', colors: ['#1E40AF', '#7C3AED', '#059669', '#D97706', '#DC2626', '#4B5563'] },
    { name: 'nature', colors: ['#166534', '#15803D', '#22C55E', '#84CC16', '#65A30D', '#4D7C0F'] },
    { name: 'sunset', colors: ['#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FFEDD5'] },
  ]

  const currentSlide = computed(() => slides.value[currentSlideIndex.value] || null)

  const isConfigured = () => {
    return !!apiKey.value && apiKey.value.trim().length > 0
  }

  function addMessage(message: Omit<Message, 'timestamp'>) {
    messages.value.push({
      ...message,
      timestamp: Date.now()
    })
  }

  function updateLastMessage(content: string) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage) {
      lastMessage.content = content
    }
  }

  function setSlides(newSlides: Slide[]) {
    slides.value = newSlides
    // Do not reset index here to support streaming updates without jumping
  }

  function appendSlides(newSlides: Slide[]) {
    slides.value = [...slides.value, ...newSlides]
  }

  function clearSlides() {
    slides.value = []
    currentSlideIndex.value = 0
  }

  function toggleLocale() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }
  
  function toggleTheme() {
    console.log('🔄 Toggling theme from', currentTheme.value)
    currentTheme.value = currentTheme.value === 'default' ? 'dark' : 'default'
    console.log('✅ Theme toggled to', currentTheme.value)
  }
  
  function toggleSketchStyle() {
    console.log('🔄 Toggling sketch style from', sketchStyle.value)
    sketchStyle.value = !sketchStyle.value
    console.log('✅ Sketch style toggled to', sketchStyle.value)
  }
  
  function updatePalette(palette: string) {
    console.log('🔄 Updating palette from', currentPalette.value, 'to', palette)
    currentPalette.value = palette
    console.log('✅ Palette updated to', currentPalette.value)
  }
  
  function updateCustomPalette(colors: string[]) {
    customPalette.value = colors
  }

  function toggleCodeEditor() {
    showCodeEditor.value = !showCodeEditor.value
  }

  function updateCurrentSlideSyntax(syntax: string) {
    const slide = slides.value[currentSlideIndex.value]
    if (slide) {
      slide.syntax = syntax
    }
  }

  function triggerExport(format: 'png' | 'svg' | 'pdf') {
    exportRequest.value = { format }
  }

  return {
    locale,
    isDark,
    toggleDark,
    toggleLocale,
    currentTheme,
    currentPalette,
    sketchStyle,
    customPalette,
    toggleTheme,
    toggleSketchStyle,
    updatePalette,
    updateCustomPalette,
    apiKey,
    baseUrl,
    model,
    isConfigured,
    messages,
    slides,
    currentSlideIndex,
    isStreaming,
    slideRenderMode,
    showCodeEditor,
    toggleCodeEditor,
    updateCurrentSlideSyntax,
    exportRequest,
    triggerExport,
    currentSlide,
    infographic,
    addMessage,
    updateLastMessage,
    setSlides,
    appendSlides,
    clearSlides,
    palettes
  }
})
