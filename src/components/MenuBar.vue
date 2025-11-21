<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { useI18n } from '../composables/useI18n'

const { t, toggleLang, currentLang } = useI18n()

const currentTime = ref('')
const isControlCenterOpen = ref(false)
const isSpotlightOpen = ref(false)

const updateTime = () => {
  currentTime.value = format(new Date(), 'EEE MMM d HH:mm')
}

let timer: number

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000) as unknown as number
})

onUnmounted(() => {
  clearInterval(timer)
})

const toggleControlCenter = () => {
  isControlCenterOpen.value = !isControlCenterOpen.value
  if (isControlCenterOpen.value) isSpotlightOpen.value = false
}

const toggleSpotlight = () => {
  isSpotlightOpen.value = !isSpotlightOpen.value
  if (isSpotlightOpen.value) isControlCenterOpen.value = false
}
</script>

<template>
  <div class="menu-bar">
    <div class="left">
      <div class="apple-logo"></div>
      <div class="menu-item font-bold">{{ t('system.finder') }}</div>
      <div class="menu-item">{{ t('menu.file') }}</div>
      <div class="menu-item">{{ t('menu.edit') }}</div>
      <div class="menu-item">{{ t('menu.view') }}</div>
      <div class="menu-item">{{ t('menu.go') }}</div>
      <div class="menu-item">{{ t('menu.window') }}</div>
      <div class="menu-item">{{ t('menu.help') }}</div>
    </div>
    <div class="right">
      <div class="menu-item" @click="toggleLang" style="cursor: pointer">
        <span class="icon">🌐</span> {{ currentLang === 'en' ? 'CN' : 'EN' }}
      </div>
      <div class="menu-item">
        <span class="icon">🔋</span> 100%
      </div>
      <div class="menu-item">
        <span class="icon">📶</span>
      </div>
      <div class="menu-item" @click="toggleSpotlight">
        <span class="icon">🔍</span>
      </div>
      <div class="menu-item" @click="toggleControlCenter">
        <span class="icon">Control Center</span>
      </div>
      <div class="menu-item time">{{ currentTime }}</div>
    </div>

    <!-- Spotlight Overlay -->
    <div class="spotlight-overlay" v-if="isSpotlightOpen">
      <div class="spotlight-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Spotlight Search" autofocus>
      </div>
    </div>

    <!-- Control Center Overlay -->
    <div class="control-center" v-if="isControlCenterOpen">
      <div class="cc-grid">
        <div class="cc-module square">
          <div class="cc-icon active">📶</div>
          <div class="cc-label">Wi-Fi</div>
        </div>
        <div class="cc-module square">
          <div class="cc-icon active">🔵</div>
          <div class="cc-label">Bluetooth</div>
        </div>
        <div class="cc-module square">
          <div class="cc-icon">✈️</div>
          <div class="cc-label">AirDrop</div>
        </div>
        <div class="cc-module square">
          <div class="cc-icon">🌙</div>
          <div class="cc-label">Focus</div>
        </div>
      </div>
      <div class="cc-slider-container">
        <div class="cc-label-small">Display</div>
        <input type="range" class="cc-slider">
      </div>
      <div class="cc-slider-container">
        <div class="cc-label-small">Sound</div>
        <input type="range" class="cc-slider">
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-bar {
  height: 30px;
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 13px;
  color: #000;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
}

.left, .right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-item {
  cursor: default;
  opacity: 0.9;
}

.menu-item:hover {
  opacity: 1;
}

.apple-logo {
  font-size: 16px;
  margin-right: 5px;
}

.font-bold {
  font-weight: 600;
}

.time {
  font-variant-numeric: tabular-nums;
}

/* Spotlight */
.spotlight-overlay {
  position: fixed;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
}

.spotlight-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
}

.spotlight-bar input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 20px;
  outline: none;
  color: #333;
}

/* Control Center */
.control-center {
  position: fixed;
  top: 40px;
  right: 10px;
  width: 300px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(30px);
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cc-module {
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.cc-module:hover {
  background: rgba(255,255,255,0.8);
}

.cc-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.cc-icon.active {
  background: #007aff;
  color: white;
}

.cc-label {
  font-size: 11px;
  font-weight: 500;
}

.cc-slider-container {
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
  padding: 10px;
}

.cc-label-small {
  font-size: 11px;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.cc-slider {
  width: 100%;
  accent-color: #fff;
}
</style>
