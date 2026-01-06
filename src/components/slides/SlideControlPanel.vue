<script lang="ts" setup>
import { onMounted } from 'vue'
import { PromptInput, ControlBar, CodeEditor } from '@/components/panel'
import { useSlideGenerator } from '@/composables/useSlideGenerator'
import { useAppStore } from '@/stores/useAppStore'
import { infographicTemplates } from '@/lib/slide-utils'

const store = useAppStore()

const {
  selectedTheme,
  pageCount,
  currentEditingPage,
  handleSend
} = useSlideGenerator()

// 初始化默认主题
onMounted(() => {
  selectedTheme.value = infographicTemplates[0]!.value
})
</script>

<template>
  <div class="flex flex-col h-full gap-3 p-4">
    <!-- 输入区域 -->
    <div class="shrink-0 space-y-3">
      <PromptInput v-model="store.inputPrompt" />
      <ControlBar 
        v-model:theme="selectedTheme" 
        v-model:page-count="pageCount"
        @generate="handleSend"
      />
    </div>

    <!-- 代码编辑器区域 -->
    <div class="flex-1">
      <CodeEditor v-model:current-page="currentEditingPage" />
    </div>
  </div>
</template>
