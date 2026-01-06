<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Minus } from 'lucide-vue-next'
import { infographicTemplates } from '@/lib/slide-utils'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/composables/useI18n'

const store = useAppStore()
const { t } = useI18n()

const selectedTheme = defineModel<string>('theme', { required: true })
const pageCount = defineModel<number>('pageCount', { required: true })

const emit = defineEmits<{
  generate: []
}>()

function incrementPageCount() {
  if (pageCount.value < 10) {
    pageCount.value++
  }
}

function decrementPageCount() {
  if (pageCount.value > 1) {
    pageCount.value--
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <!-- 左侧：主题选择和页码控制 -->
    <div class="flex items-center gap-2 flex-1">
      <!-- 主题选择 -->
      <Select v-model="selectedTheme">
        <SelectTrigger 
          class="h-9 min-w-[140px] max-w-[200px] text-xs font-medium border border-border/50 bg-card focus:ring-0"
          :disabled="store.isStreaming"
        >
          <SelectValue :placeholder="t('selectTemplate').value" class="truncate" />
        </SelectTrigger>
        <SelectContent class="w-[200px]">
          <SelectItem 
            v-for="template in infographicTemplates" 
            :key="template.value" 
            :value="template.value"
            class="text-xs cursor-pointer py-2"
          >
            {{ template.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- 页码数量控制 -->
      <div class="flex items-center gap-1.5 border border-border/50 rounded-lg px-2 py-1 bg-card">
        <span class="text-xs text-muted-foreground whitespace-nowrap">{{ t('pageCount').value }}:</span>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-6 w-6 p-0 hover:bg-primary/10"
          @click="decrementPageCount"
          :disabled="pageCount <= 1 || store.isStreaming"
        >
          <Minus class="h-3 w-3" />
        </Button>
        <span class="text-xs font-medium w-4 text-center">{{ pageCount }}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-6 w-6 p-0 hover:bg-primary/10"
          @click="incrementPageCount"
          :disabled="pageCount >= 10 || store.isStreaming"
        >
          <Plus class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <!-- 右侧：生成按钮 -->
    <Button 
      @click="emit('generate')"
      class="h-9 px-5 text-xs font-medium shadow-sm hover:shadow-md transition-all"
      :disabled="store.isStreaming"
    >
      {{ t('generate').value }}
    </Button>
  </div>
</template>
