<script lang="ts" setup>
import {computed, nextTick, ref, watch} from 'vue'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {ChevronLeft, ChevronRight, Loader2, Play} from 'lucide-vue-next'
import {useAppStore} from '@/stores/useAppStore'
import {useI18n} from '@/composables/useI18n'

const store = useAppStore()
const { t } = useI18n()

const currentEditingPage = defineModel<number>('currentPage', { required: true })
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Computed: 当前显示的幻灯片代码
const currentSlideCode = computed(() => {
  const slide = store.slides[currentEditingPage.value]
  return slide?.syntax || ''
})

// Computed: 分页信息
const pageRange = computed(() => {
  return Array.from({ length: store.slides.length }, (_, i) => i)
})

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.scrollTop = textareaRef.value.scrollHeight
    }
  })
}

// 监听幻灯片代码变化，自动滚动到底部
watch(currentSlideCode, () => {
  scrollToBottom()
})

// 监听幻灯片变化，自动切换到最后一页
watch(() => store.slides.length, (newLength) => {
  if (newLength > 0) {
    currentEditingPage.value = newLength - 1
  }
})

// 监听当前幻灯片索引变化
watch(() => store.currentSlideIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < store.slides.length) {
    currentEditingPage.value = newIndex
    // 切换页码后也滚动到底部
    scrollToBottom()
  }
})

function handleCodeInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  const slideIndex = currentEditingPage.value
  if (slideIndex >= 0 && slideIndex < store.slides.length) {
    store.updateSlideSyntax(slideIndex, target.value)
  }
}

function handlePageChange(direction: number) {
  const newIndex = currentEditingPage.value + direction
  if (newIndex >= 0 && newIndex < store.slides.length) {
    currentEditingPage.value = newIndex
    store.currentSlideIndex = newIndex
  }
}

function handlePageSelect(index: number) {
  currentEditingPage.value = index
  store.currentSlideIndex = index
}

function handleRerender() {
  const slideIndex = currentEditingPage.value
  if (slideIndex >= 0 && slideIndex < store.slides.length) {
    const slide = store.slides[slideIndex]
    if (slide) {
      // 更新幻灯片内容，触发重新渲染
      slide.content = slide.syntax
      // 强制更新当前幻灯片索引以触发重新渲染
      store.currentSlideIndex = slideIndex
    }
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-card rounded-xl border border-border/50 overflow-hidden">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30 shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-foreground/80">{{ t('aiResponseCode').value }}</span>
        <div v-if="store.slides.length > 0" class="flex items-center gap-1.5 ml-2">
          <!-- 上一页按钮 -->
          <Button 
            :disabled="currentEditingPage <= 0"
            class="h-6 w-6 p-0 hover:bg-primary/10"
            size="icon"
            variant="ghost"
            @click="handlePageChange(-1)"
          >
            <ChevronLeft class="h-3.5 w-3.5" />
          </Button>
          
          <!-- 页码显示 -->
          <span class="text-xs font-medium text-primary min-w-[40px] text-center">
            {{ currentEditingPage + 1 }} / {{ store.slides.length || 1 }}
          </span>
          
          <!-- 下一页按钮 -->
          <Button 
            :disabled="currentEditingPage >= store.slides.length - 1"
            class="h-6 w-6 p-0 hover:bg-primary/10"
            size="icon"
            variant="ghost"
            @click="handlePageChange(1)"
          >
            <ChevronRight class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div v-if="store.isStreaming" class="flex items-center gap-1.5 text-xs text-primary/70">
          <Loader2 class="h-3 w-3 animate-spin" />
          <span>{{ t('generating').value }}</span>
        </div>
        
        <Button
          v-if="store.slides.length > 0"
          :title="t('rerender').value"
          class="h-6 w-6 p-0 hover:bg-primary/10"
          size="icon"
          variant="ghost"
          @click="handleRerender"
        >
          <Play class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    <!-- 代码内容区域 -->
    <div class="flex-1 overflow-hidden relative bg-muted/20">
      <textarea 
        ref="textareaRef"
        :placeholder="store.slides.length === 0 ? t('waitingGeneration').value : t('viewEditCode').value"
        :value="currentSlideCode"
        class="absolute inset-0 w-full rounded-none border-0 resize-none font-mono text-[13px] p-3 focus:outline-none leading-relaxed bg-transparent text-foreground overflow-y-auto"
        spellcheck="false"
        @input="handleCodeInput"
      />
    </div>
  </div>
</template>
