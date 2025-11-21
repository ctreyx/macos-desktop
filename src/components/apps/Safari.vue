<script setup lang="ts">
import { ref } from 'vue'

const currentUrl = ref('https://www.wikipedia.org')
const inputUrl = ref('wikipedia.org')
const isLoading = ref(false)

const navigate = () => {
  let url = inputUrl.value.trim()
  if (!url) return
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  
  currentUrl.value = url
  isLoading.value = true
}

const onLoad = () => {
  isLoading.value = false
}
</script>

<template>
  <div class="safari-container">
    <div class="toolbar">
      <div class="controls">
        <button class="nav-btn">‹</button>
        <button class="nav-btn">›</button>
      </div>
      <div class="url-input-container">
        <span class="lock">🔒</span>
        <input 
          v-model="inputUrl" 
          @keyup.enter="navigate"
          type="text" 
          class="url-input"
          placeholder="Search or enter website name"
        >
      </div>
      <button class="reload-btn" @click="navigate">↻</button>
    </div>
    <div class="content-area">
      <iframe 
        :src="currentUrl" 
        class="browser-frame"
        @load="onLoad"
        sandbox="allow-scripts allow-same-origin allow-forms"
      ></iframe>
      <div v-if="isLoading" class="loading-bar"></div>
    </div>
  </div>
</template>

<style scoped>
.safari-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  gap: 10px;
  height: 36px;
  box-sizing: border-box;
}

.controls {
  display: flex;
  gap: 8px;
}

.nav-btn, .reload-btn {
  background: none;
  border: none;
  color: #555;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 1;
  display: flex;
  align-items: center;
}

.nav-btn:hover, .reload-btn:hover {
  background: rgba(0,0,0,0.05);
  color: #000;
}

.url-input-container {
  flex: 1;
  background: #e0e0e0;
  border-radius: 8px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.url-input-container:focus-within {
  background: #fff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0,122,255,0.2);
}

.lock {
  font-size: 10px;
  opacity: 0.5;
}

.url-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #333;
  height: 100%;
  width: 100%;
}

.content-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #fff;
}

.browser-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background: #007aff;
  width: 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>