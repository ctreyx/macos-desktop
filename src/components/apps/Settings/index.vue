<script setup lang="ts">
import { useSettings } from './composables/useSettings'
import './style.css'

defineProps<{
  wallpaper: string
}>()

const emit = defineEmits<{
  (e: 'update:wallpaper', url: string): void
}>()

const {
  t,
  activeTab,
  setActiveTab,
  defaultWallpapers,
  handleFileChange,
  selectWallpaper
} = useSettings(emit)
</script>

<template>
  <div class="settings-container">
    <div class="sidebar">
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'general' }"
        @click="setActiveTab('general')"
      >
        {{ t('settings.general') }}
      </div>
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'wallpaper' }"
        @click="setActiveTab('wallpaper')"
      >
        {{ t('settings.wallpaper') }}
      </div>
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'display' }"
        @click="setActiveTab('display')"
      >
        {{ t('settings.display') }}
      </div>
    </div>
    
    <div class="content-area">
      <div v-if="activeTab === 'wallpaper'" class="wallpaper-settings">
        <h2>{{ t('settings.desktopWallpaper') }}</h2>
        
        <div class="current-preview">
          <img :src="wallpaper" alt="Current Wallpaper" />
          <div class="preview-label">{{ t('settings.currentDesktop') }}</div>
        </div>

        <h3>{{ t('settings.defaultWallpapers') }}</h3>
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

        <h3>{{ t('settings.customWallpaper') }}</h3>
        <div class="upload-section">
          <label class="upload-btn">
            {{ t('settings.uploadImage') }}
            <input type="file" accept="image/*" @change="handleFileChange" hidden />
          </label>
          <p class="upload-hint">{{ t('settings.supportedFormats') }}</p>
        </div>
      </div>
      
      <div v-else class="placeholder-content">
        <h2>{{ t(`settings.${activeTab}`) }} {{ t('settings.settings') }}</h2>
        <p>{{ t('settings.underConstruction') }}</p>
      </div>
    </div>
  </div>
</template>
