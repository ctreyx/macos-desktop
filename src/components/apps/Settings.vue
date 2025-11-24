<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  wallpaper: string
}>()

const emit = defineEmits<{
  (e: 'update:wallpaper', url: string): void
}>()

const activeTab = ref('wallpaper')

const defaultWallpapers = [
  { name: 'Monterey', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'Big Sur', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'Desert', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
]

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        emit('update:wallpaper', e.target.result as string)
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const selectWallpaper = (url: string) => {
  emit('update:wallpaper', url)
}
</script>

<template>
  <div class="settings-container">
    <div class="sidebar">
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'general' }"
        @click="activeTab = 'general'"
      >
        General
      </div>
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'wallpaper' }"
        @click="activeTab = 'wallpaper'"
      >
        Wallpaper
      </div>
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'display' }"
        @click="activeTab = 'display'"
      >
        Display
      </div>
    </div>
    
    <div class="content-area">
      <div v-if="activeTab === 'wallpaper'" class="wallpaper-settings">
        <h2>Desktop Wallpaper</h2>
        
        <div class="current-preview">
          <img :src="wallpaper" alt="Current Wallpaper" />
          <div class="preview-label">Current Desktop</div>
        </div>

        <h3>Default Wallpapers</h3>
        <div class="wallpaper-grid">
          <div 
            v-for="(wp, index) in defaultWallpapers" 
            :key="index"
            class="wallpaper-item"
            :class="{ active: wallpaper === wp.url }"
            @click="selectWallpaper(wp.url)"
          >
            <img :src="wp.url" :alt="wp.name" />
            <div class="wp-name">{{ wp.name }}</div>
          </div>
        </div>

        <h3>Custom Wallpaper</h3>
        <div class="upload-section">
          <label class="upload-btn">
            Upload Image
            <input type="file" accept="image/*" @change="handleFileChange" hidden />
          </label>
          <p class="upload-hint">Supported formats: JPG, PNG, WebP</p>
        </div>
      </div>
      
      <div v-else class="placeholder-content">
        <h2>{{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }} Settings</h2>
        <p>This section is under construction.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  height: 100%;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
}

.sidebar {
  width: 200px;
  background: rgba(240, 240, 240, 0.8);
  border-right: 1px solid #d1d1d1;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sidebar-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background 0.2s;
}

.sidebar-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar-item.active {
  background: #007aff;
  color: white;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.wallpaper-settings h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.wallpaper-settings h3 {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.current-preview {
  width: 300px;
  margin-bottom: 30px;
}

.current-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 4px solid white;
}

.preview-label {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.wallpaper-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.wallpaper-item:hover {
  transform: scale(1.02);
}

.wallpaper-item img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid transparent;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.wallpaper-item.active img {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.wp-name {
  font-size: 11px;
  text-align: center;
  margin-top: 6px;
  color: #444;
}

.upload-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px dashed #ccc;
  text-align: center;
}

.upload-btn {
  display: inline-block;
  background: #fff;
  border: 1px solid #ccc;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.upload-btn:active {
  background: #f0f0f0;
}

.upload-hint {
  margin-top: 10px;
  font-size: 11px;
  color: #888;
}

.placeholder-content {
  text-align: center;
  color: #888;
  margin-top: 50px;
}
</style>
