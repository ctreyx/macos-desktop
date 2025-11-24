<script setup lang="ts">
import { ref } from 'vue'
import MenuBar from './components/MenuBar.vue'
import Dock from './components/Dock.vue'
import Window from './components/Window.vue'
import Safari from './components/apps/Safari.vue'
import Maps from './components/apps/Maps.vue'
import Games from './components/apps/Games/index.vue'
import Weather from './components/apps/Weather.vue'
import ContextMenu from './components/ContextMenu.vue'
import { useI18n } from './composables/useI18n'

const { t } = useI18n()

interface WindowState {
  id: string
  title: string
  isOpen: boolean
  isMinimized: boolean
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  content: string
  transparent?: boolean
}

const windows = ref<WindowState[]>([
  { id: 'finder', title: 'Finder', isOpen: true, isMinimized: false, x: 100, y: 100, width: 600, height: 400, zIndex: 1, content: 'Finder Content' },
  { id: 'safari', title: 'Safari', isOpen: false, isMinimized: false, x: 150, y: 150, width: 800, height: 500, zIndex: 2, content: 'Safari Browser' },
  { id: 'messages', title: 'Messages', isOpen: false, isMinimized: false, x: 200, y: 200, width: 400, height: 600, zIndex: 3, content: 'Messages App' },
  { id: 'mail', title: 'Mail', isOpen: false, isMinimized: false, x: 250, y: 250, width: 800, height: 600, zIndex: 4, content: 'Mail App' },
  { id: 'maps', title: 'Maps', isOpen: false, isMinimized: false, x: 300, y: 300, width: 800, height: 600, zIndex: 5, content: 'Maps App' },
  { id: 'photos', title: 'Photos', isOpen: false, isMinimized: false, x: 350, y: 350, width: 800, height: 600, zIndex: 6, content: 'Photos App' },
  { id: 'games', title: 'Game Center', isOpen: false, isMinimized: false, x: 400, y: 150, width: 800, height: 600, zIndex: 7, content: 'Games App', transparent: true },
  { id: 'weather', title: 'Weather', isOpen: false, isMinimized: false, x: 450, y: 200, width: 400, height: 500, zIndex: 8, content: 'Weather App', transparent: true },
  { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, x: 400, y: 400, width: 600, height: 400, zIndex: 9, content: 'Settings App' },
])

const activeWindowId = ref<string>('finder')
const isLaunchpadOpen = ref(false)

// Context Menu State
const contextMenuState = ref({
  visible: false,
  x: 0,
  y: 0
})

const handleContextMenu = (e: MouseEvent) => {
  // Only show if clicking on desktop background (not on windows/dock/menubar)
  // But since windows are in a container with pointer-events: none (except the window itself),
  // and this handler is on .desktop, we need to check target.
  // Actually, the .desktop div covers everything.
  // We can just let it bubble up. If a window handles it, it should stop propagation.
  // But for now, let's just show it.
  
  // Simple check: if target is the desktop background or windows container
  const target = e.target as HTMLElement
  if (target.classList.contains('desktop') || target.classList.contains('windows-container')) {
    contextMenuState.value = {
      visible: true,
      x: e.clientX,
      y: e.clientY
    }
  }
}

const closeContextMenu = () => {
  contextMenuState.value.visible = false
}

const handleMenuAction = (action: string) => {
  if (action === 'new-folder') {
    // Add a dummy folder to desktop (visual only for now as we don't have desktop icons state yet)
    alert('New Folder created on Desktop')
  } else if (action === 'change-bg') {
    openWindow('settings')
  } else if (action === 'get-info') {
    alert('Desktop Info: macOS Simulator v1.0')
  }
}

const focusWindow = (id: string | number) => {
  const strId = String(id)
  activeWindowId.value = strId
  const win = windows.value.find(w => w.id === strId)
  if (win) {
    win.isMinimized = false
    const maxZ = Math.max(...windows.value.map(w => w.zIndex))
    if (win.zIndex < maxZ) {
      win.zIndex = maxZ + 1
    }
  }
}

const minimizeWindow = (id: string | number) => {
  const win = windows.value.find(w => w.id === String(id))
  if (win) {
    win.isMinimized = true
    activeWindowId.value = '' // Clear focus
  }
}

const closeWindow = (id: string | number) => {
  const win = windows.value.find(w => w.id === String(id))
  if (win) {
    win.isOpen = false
    win.isMinimized = false
  }
}

const openWindow = (id: string) => {
  if (id === 'launchpad') {
    isLaunchpadOpen.value = !isLaunchpadOpen.value
    return
  }
  if (id === 'trash') {
    // Simple alert for trash
    alert('Trash is empty')
    return
  }

  // Close launchpad if opening an app
  isLaunchpadOpen.value = false

  const win = windows.value.find(w => w.id === id)
  if (win) {
    if (win.isOpen && !win.isMinimized && activeWindowId.value === win.id) {
      // If already open, focused, and not minimized -> minimize it (Dock behavior)
      minimizeWindow(win.id)
    } else {
      win.isOpen = true
      win.isMinimized = false
      focusWindow(win.id)
    }
  } else {
    // Fallback if ID doesn't match (e.g. if we passed title)
    const winByTitle = windows.value.find(w => w.title.toLowerCase() === id.toLowerCase())
    if (winByTitle) {
      winByTitle.isOpen = true
      winByTitle.isMinimized = false
      focusWindow(winByTitle.id)
    }
  }
}
</script>

<template>
  <div class="desktop" @contextmenu.prevent="handleContextMenu">
    <MenuBar />
    
    <div class="windows-container">
      <Window 
        v-for="win in windows" 
        :key="win.id"
        v-show="win.isOpen && !win.isMinimized"
        :id="win.id"
        :title="t(`system.${win.id}`)"
        v-model:x="win.x"
        v-model:y="win.y"
        v-model:width="win.width"
        v-model:height="win.height"
        :z-index="win.zIndex"
        :is-active="activeWindowId === win.id"
        :transparent="win.transparent"
        @focus="focusWindow"
        @close="closeWindow"
        @minimize="minimizeWindow"
      >
        <div class="window-content">
          <div v-if="win.id === 'finder'" class="finder-content">
            <div class="sidebar">
              <div class="sidebar-item active">Recents</div>
              <div class="sidebar-item">Applications</div>
              <div class="sidebar-item">Desktop</div>
              <div class="sidebar-item">Documents</div>
              <div class="sidebar-item">Downloads</div>
            </div>
            <div class="main-area">
              <div class="file-grid">
                <div class="file-item">📁 Project A</div>
                <div class="file-item">📄 Resume.pdf</div>
                <div class="file-item">🖼️ Photo.jpg</div>
              </div>
            </div>
          </div>
          <div v-else-if="win.id === 'safari'" class="safari-content">
            <Safari />
          </div>
          <div v-else-if="win.id === 'messages'" class="messages-content">
            <div class="msg-sidebar">
              <div class="msg-item active">
                <div class="avatar">👤</div>
                <div class="msg-info">
                  <div class="name">John Doe</div>
                  <div class="preview">Hey, how are you?</div>
                </div>
              </div>
              <div class="msg-item">
                <div class="avatar">👩</div>
                <div class="msg-info">
                  <div class="name">Jane Smith</div>
                  <div class="preview">Meeting at 3pm</div>
                </div>
              </div>
            </div>
            <div class="msg-main">
              <div class="msg-bubble received">Hey, how are you?</div>
              <div class="msg-bubble sent">I'm good, thanks! Working on this macOS clone.</div>
            </div>
          </div>
          <div v-else-if="win.id === 'mail'" class="mail-content">
            <div class="mail-sidebar">
              <div class="mail-item active">
                <div class="sender">Apple</div>
                <div class="subject">Your receipt</div>
              </div>
              <div class="mail-item">
                <div class="sender">GitHub</div>
                <div class="subject">New comment on issue</div>
              </div>
            </div>
            <div class="mail-main">
              <h2>Your receipt</h2>
              <div class="mail-meta">From: Apple &lt;no-reply@apple.com&gt;</div>
              <div class="mail-body">
                Thank you for your purchase.
              </div>
            </div>
          </div>
          <div v-else-if="win.id === 'photos'" class="photos-content">
            <div class="photo-grid">
              <div class="photo-item" v-for="i in 12" :key="i">
                <div class="photo-placeholder">IMG_{{i}}</div>
              </div>
            </div>
          </div>
          <div v-else-if="win.id === 'maps'" class="maps-content">
            <Maps />
          </div>
          <div v-else-if="win.id === 'games'" class="games-content">
            <Games />
          </div>
          <div v-else-if="win.id === 'weather'" class="weather-wrapper">
            <Weather />
          </div>
          <div v-else-if="win.id === 'settings'" class="settings-content">
             <div class="settings-list">
               <div class="setting-item">General</div>
               <div class="setting-item">Display</div>
               <div class="setting-item">Sound</div>
               <div class="setting-item">Network</div>
             </div>
          </div>
          <div v-else>
            {{ win.content }}
          </div>
        </div>
      </Window>
    </div>

    <!-- Launchpad Overlay -->
    <div class="launchpad-overlay" v-if="isLaunchpadOpen" @click="isLaunchpadOpen = false">
      <div class="launchpad-grid">
        <div class="launchpad-item" @click.stop="openWindow('finder')">
          <div class="lp-icon">😊</div>
          <div class="lp-name">{{ t('system.finder') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('safari')">
          <div class="lp-icon">🧭</div>
          <div class="lp-name">{{ t('system.safari') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('messages')">
          <div class="lp-icon">💬</div>
          <div class="lp-name">{{ t('system.messages') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('mail')">
          <div class="lp-icon">✉️</div>
          <div class="lp-name">{{ t('system.mail') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('maps')">
          <div class="lp-icon">🗺️</div>
          <div class="lp-name">{{ t('system.maps') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('photos')">
          <div class="lp-icon">🖼️</div>
          <div class="lp-name">{{ t('system.photos') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('games')">
          <div class="lp-icon">🎮</div>
          <div class="lp-name">{{ t('system.games') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('weather')">
          <div class="lp-icon">⛅</div>
          <div class="lp-name">{{ t('system.weather') }}</div>
        </div>
        <div class="launchpad-item" @click.stop="openWindow('settings')">
          <div class="lp-icon">⚙️</div>
          <div class="lp-name">{{ t('system.settings') }}</div>
        </div>
        <!-- Extra dummy apps to fill space -->
        <div class="launchpad-item">
          <div class="lp-icon">🎵</div>
          <div class="lp-name">Music</div>
        </div>
        <div class="launchpad-item">
          <div class="lp-icon">📝</div>
          <div class="lp-name">Notes</div>
        </div>
        <div class="launchpad-item">
          <div class="lp-icon">📅</div>
          <div class="lp-name">Calendar</div>
        </div>
        <div class="launchpad-item">
          <div class="lp-icon">🧮</div>
          <div class="lp-name">Calculator</div>
        </div>
      </div>
    </div>

    <Dock 
      :open-apps="windows.filter(w => w.isOpen).map(w => w.id)"
      @open-app="openWindow" 
    />

    <ContextMenu 
      :visible="contextMenuState.visible"
      :x="contextMenuState.x"
      :y="contextMenuState.y"
      @close="closeContextMenu"
      @action="handleMenuAction"
    />
  </div>
</template>

<style scoped>
.desktop {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

/* Launchpad Styles */
.launchpad-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 8000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(1.1); }
  to { opacity: 1; transform: scale(1); }
}

.launchpad-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 40px;
  padding: 40px;
  max-width: 1000px;
}

.launchpad-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.launchpad-item:hover {
  transform: scale(1.1);
}

.lp-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.lp-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.windows-container {
  position: absolute;
  top: 30px; /* Menu bar height */
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* Let clicks pass through to desktop icons if any */
  overflow: hidden;
  z-index: 10;
}

.window-content {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Finder Styles */
.finder-content {
  display: flex;
  height: 100%;
}
.sidebar {
  width: 150px;
  background: #f5f5f5;
  padding: 10px;
  border-right: 1px solid #ddd;
}
.sidebar-item {
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
  color: #444;
  font-size: 13px;
}
.sidebar-item.active {
  background: #e0e0e0;
}
.main-area {
  flex: 1;
  padding: 20px;
  background: #fff;
}
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
}
.file-item {
  text-align: center;
  font-size: 12px;
  cursor: pointer;
}

/* Safari Styles */
.safari-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
/* Removed old Safari styles as they are now in Safari.vue */

/* Settings Styles */
.settings-content {
  padding: 10px;
}
.setting-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.setting-item:hover {
  background: #f9f9f9;
}

/* Messages Styles */
.messages-content {
  display: flex;
  height: 100%;
}
.msg-sidebar {
  width: 200px;
  border-right: 1px solid #ddd;
  background: #f5f5f5;
}
.msg-item {
  padding: 10px;
  display: flex;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.msg-item.active {
  background: #007aff;
  color: white;
}
.msg-item.active .preview {
  color: rgba(255,255,255,0.8);
}
.avatar {
  width: 30px;
  height: 30px;
  background: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg-info {
  flex: 1;
  overflow: hidden;
}
.name {
  font-weight: 600;
  font-size: 13px;
}
.preview {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msg-main {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
}
.msg-bubble {
  padding: 8px 12px;
  border-radius: 16px;
  max-width: 70%;
  font-size: 13px;
}
.msg-bubble.received {
  background: #e5e5ea;
  align-self: flex-start;
}
.msg-bubble.sent {
  background: #007aff;
  color: white;
  align-self: flex-end;
}

/* Mail Styles */
.mail-content {
  display: flex;
  height: 100%;
}
.mail-sidebar {
  width: 250px;
  border-right: 1px solid #ddd;
  background: #f5f5f5;
}
.mail-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}
.mail-item.active {
  background: #007aff;
  color: white;
}
.sender {
  font-weight: 600;
  font-size: 13px;
}
.subject {
  font-size: 12px;
}
.mail-main {
  flex: 1;
  padding: 20px;
  background: #fff;
}
.mail-meta {
  color: #888;
  font-size: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* Photos Styles */
.photos-content {
  height: 100%;
  background: #fff;
  overflow-y: auto;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  padding: 10px;
}
.photo-item {
  aspect-ratio: 1;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
}
.photo-placeholder {
  color: #aaa;
  font-size: 12px;
}

/* Maps Styles */
.maps-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
/* Removed old Maps styles as they are now in Maps.vue */

/* Weather Wrapper */
.weather-wrapper {
  height: 100%;
  width: 100%;
}

/* Games Wrapper */
.games-content {
  height: 100%;
}
</style>
