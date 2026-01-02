<script lang="ts" setup>
import { useAppStore } from '@/stores/useAppStore'
import { X, Code } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const store = useAppStore()
const { t } = useI18n()
const localSyntax = ref('')

// Sync when slide changes
watch(() => store.currentSlide?.syntax, (newVal) => {
  // Only update local if it's significantly different (avoid cursor jumps if we were using a more complex editor, 
  // but with v-model on Textarea and @input updating store, simple sync is safer to avoid loop)
  // Actually, if we type in textarea -> localSyntax updates -> handleInput -> store updates.
  // Store update might trigger this watch. 
  // If store val == local val, no change.
  if (newVal !== undefined && newVal !== localSyntax.value) {
    localSyntax.value = newVal
  }
}, { immediate: true })

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  // Real-time update
  store.updateCurrentSlideSyntax(target.value)
}

function handleClose() {
  store.showCodeEditor = false
}
</script>

<template>
  <div class="flex flex-col h-full w-full bg-background/60 backdrop-blur-xl border border-border shadow-2xl rounded-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20 shrink-0">
      <div class="flex items-center gap-2 font-medium text-sm">
        <Code class="h-4 w-4 text-primary" />
        <span>{{ t('slideSyntax').value }}</span>
      </div>
      <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full hover:bg-background/40" @click="handleClose">
        <X class="h-4 w-4" />
      </Button>
    </div>
    <div class="flex-1 p-0 overflow-hidden relative">
        <Textarea 
            v-model="localSyntax"
            @input="handleInput"
            class="h-full w-full rounded-none border-0 resize-none font-mono text-[11px] p-4 focus-visible:ring-0 leading-relaxed bg-transparent"
            spellcheck="false"
            placeholder="Loading slide syntax..."
        />
        <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/40 to-transparent backdrop-blur-[2px] pointer-events-none border-t border-border/10" />
    </div>
  </div>
</template>
