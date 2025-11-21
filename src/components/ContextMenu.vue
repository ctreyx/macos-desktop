<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()

interface MenuItem {
  label: string
  action: string
  separator?: boolean
  hasSubmenu?: boolean
}

const props = defineProps<{
  x: number
  y: number
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'action', action: string): void
}>()

const menuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (props.visible && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const menuItems = ref<MenuItem[]>([])

watchEffect(() => {
  menuItems.value = [
    { label: t('context.newFolder'), action: 'new-folder' },
    { label: t('context.getInfo'), action: 'get-info' },
    { label: t('context.changeBg'), action: 'change-bg', separator: true },
    { label: t('context.useStacks'), action: 'use-stacks' },
    { label: t('context.sortBy'), action: 'sort-by', hasSubmenu: true },
    { label: t('context.cleanUp'), action: 'clean-up' },
    { label: t('context.cleanUpBy'), action: 'clean-up-by', hasSubmenu: true },
    { label: t('context.showViewOptions'), action: 'view-options' },
  ]
})

const handleAction = (action: string) => {
  emit('action', action)
  emit('close')
}
</script>

<template>
  <div 
    v-if="visible"
    ref="menuRef"
    class="context-menu"
    :style="{ top: `${y}px`, left: `${x}px` }"
    @contextmenu.prevent
  >
    <div 
      v-for="(item, index) in menuItems" 
      :key="index"
    >
      <div v-if="item.separator" class="separator"></div>
      <div 
        class="menu-item"
        @click="handleAction(item.action)"
      >
        <span>{{ item.label }}</span>
        <span v-if="item.hasSubmenu" class="arrow">›</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  width: 220px;
  background: rgba(245, 245, 245, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  padding: 5px;
  z-index: 99999;
  font-size: 13px;
  color: #333;
  user-select: none;
}

.menu-item {
  padding: 4px 10px;
  border-radius: 4px;
  cursor: default;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item:hover {
  background: #007aff;
  color: white;
}

.separator {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 10px;
}

.arrow {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}
</style>