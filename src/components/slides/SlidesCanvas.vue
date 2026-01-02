<script lang="ts" setup>
import {useAppStore} from '@/stores/useAppStore'
import SlidePreview from './SlidePreview.vue'
import {Loader2, LayoutTemplate} from 'lucide-vue-next'
import {useI18n} from '@/composables/useI18n'

const store = useAppStore()
const { t } = useI18n()
</script>

<template>
  <div class="flex-1 p-4 bg-muted/20 overflow-hidden flex items-center justify-center relative">
    <Transition mode="out-in" name="fade">
      <div 
        v-if="store.currentSlide"
        :key="store.currentSlide.id"
        class="w-full h-full bg-background rounded-xl overflow-hidden relative border border-border/50 shadow-sm"
      >
         <SlidePreview 
           :id="store.currentSlide.id"
           :syntax="store.currentSlide.syntax"
         />
      </div>
      <div v-else class="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
         <div class="bg-muted p-4 rounded-full">
           <LayoutTemplate class="h-10 w-10 text-muted-foreground/50" />
         </div>
         <p class="font-medium">{{ t('readyToCreate').value }}</p>
         <p class="text-sm text-muted-foreground/70">{{ t('waitingPlaceholder').value }}</p>
      </div>
    </Transition>

    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="store.isStreaming" class="absolute top-6 right-6 bg-background/90 backdrop-blur-md border border-border rounded-full px-4 py-2 flex items-center gap-2.5 shadow-sm z-50">
         <Loader2 class="h-4 w-4 animate-spin text-primary" />
         <span class="text-xs font-medium text-foreground">{{ t('rendering').value }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
