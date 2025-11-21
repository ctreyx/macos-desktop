<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useI18n } from '../composables/useI18n'

defineProps<{
  openApps: string[]
}>()

const emit = defineEmits<{
  (e: 'open-app', id: string): void
}>()

const { t } = useI18n()

interface DockApp {
  id: string
  name: string
  icon: string
}

const apps = ref<DockApp[]>([])

watchEffect(() => {
  apps.value = [
    { id: 'finder', name: t('system.finder'), icon: '😊' },
    { id: 'launchpad', name: t('system.launchpad'), icon: '🚀' },
    { id: 'safari', name: t('system.safari'), icon: '🧭' },
    { id: 'messages', name: t('system.messages'), icon: '💬' },
    { id: 'mail', name: t('system.mail'), icon: '✉️' },
    { id: 'maps', name: t('system.maps'), icon: '🗺️' },
    { id: 'photos', name: t('system.photos'), icon: '🖼️' },
    { id: 'games', name: t('system.games'), icon: '🎮' },
    { id: 'weather', name: t('system.weather'), icon: '⛅' },
    { id: 'settings', name: t('system.settings'), icon: '⚙️' },
    { id: 'trash', name: t('system.trash'), icon: '🗑️' },
  ]
})
</script>

<template>
  <div class="dock-container">
    <div class="dock">
      <div 
        v-for="app in apps" 
        :key="app.id" 
        class="dock-item"
        @click="emit('open-app', app.id)"
      >
        <div class="icon-box">
          {{ app.icon }}
        </div>
        <div class="tooltip">{{ app.name }}</div>
        <div class="dot" v-if="openApps.includes(app.id)"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dock-container {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 9000;
}

.dock {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 10px;
  display: flex;
  gap: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
  padding-bottom: 12px; /* Space for dot */
}

.dock-item {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dock-item:hover {
  transform: scale(1.2) translateY(-10px);
}

.icon-box {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.dock-item:hover .tooltip {
  opacity: 1;
}

.dot {
  width: 4px;
  height: 4px;
  background: #333;
  border-radius: 50%;
  margin-top: 4px;
  position: absolute;
  bottom: -8px;
}
</style>
