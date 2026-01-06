<script lang="ts" setup>
import { ref } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const modelValue = defineModel<string>({ required: true })

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
  }
}
</script>

<template>
  <div class="relative">
    <Textarea 
      v-model="modelValue" 
      :placeholder="t('sendPlaceholder').value || '输入幻灯片生成提示词...'"
      class="min-h-[80px] max-h-[120px] w-full resize-none border border-border/50 bg-card focus-visible:ring-1 focus-visible:ring-primary/50 text-sm rounded-lg"
      @keydown="handleKeydown"
    />
  </div>
</template>
