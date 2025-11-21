<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

const props = defineProps<{
  id: number | string
  title: string
  x: number
  y: number
  width?: number
  height?: number
  zIndex: number
  isActive?: boolean
  transparent?: boolean
}>()

const emit = defineEmits<{
  (e: 'close', id: number | string): void
  (e: 'focus', id: number | string): void
  (e: 'update:x', x: number): void
  (e: 'update:y', y: number): void
  (e: 'update:width', width: number): void
  (e: 'update:height', height: number): void
  (e: 'minimize', id: number | string): void
}>()

const windowRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const isMaximized = ref(false)
const preMaximizeState = ref({ x: 0, y: 0, width: 0, height: 0 })
const dragOffset = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// Local position state to handle dragging smoothly without waiting for parent update
const localX = ref(props.x)
const localY = ref(props.y)
const localWidth = ref(props.width || 600)
const localHeight = ref(props.height || 400)

watch(() => props.x, (newX) => { if (!isDragging.value) localX.value = newX })
watch(() => props.y, (newY) => { if (!isDragging.value) localY.value = newY })
watch(() => props.width, (newW) => { if (!isResizing.value && newW) localWidth.value = newW })
watch(() => props.height, (newH) => { if (!isResizing.value && newH) localHeight.value = newH })

const toggleMaximize = () => {
  if (isMaximized.value) {
    // Restore
    isMaximized.value = false
    localX.value = preMaximizeState.value.x
    localY.value = preMaximizeState.value.y
    localWidth.value = preMaximizeState.value.width
    localHeight.value = preMaximizeState.value.height
  } else {
    // Maximize
    preMaximizeState.value = { 
      x: localX.value, 
      y: localY.value, 
      width: localWidth.value, 
      height: localHeight.value 
    }
    isMaximized.value = true
    localX.value = 0
    localY.value = 0
  }
}

const startDrag = (e: MouseEvent) => {
  if (!windowRef.value || isMaximized.value) return
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - localX.value,
    y: e.clientY - localY.value
  }
  emit('focus', props.id)
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  localX.value = newX
  localY.value = newY
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  // Sync back to parent on drop
  emit('update:x', localX.value)
  emit('update:y', localY.value)
}

const startResize = (e: MouseEvent) => {
  if (isMaximized.value) return
  e.stopPropagation()
  isResizing.value = true
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: localWidth.value,
    height: localHeight.value
  }
  emit('focus', props.id)
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const deltaX = e.clientX - resizeStart.value.x
  const deltaY = e.clientY - resizeStart.value.y
  
  const newWidth = Math.max(300, resizeStart.value.width + deltaX)
  const newHeight = Math.max(200, resizeStart.value.height + deltaY)
  
  localWidth.value = newWidth
  localHeight.value = newHeight
}

const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
  emit('update:width', localWidth.value)
  emit('update:height', localHeight.value)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>

<template>
  <div 
    ref="windowRef"
    class="window"
    :class="{ active: isActive, maximized: isMaximized, transparent: transparent }"
    :style="!isMaximized ? { 
      transform: `translate(${localX}px, ${localY}px)`,
      zIndex: zIndex,
      width: `${localWidth}px`,
      height: `${localHeight}px`
    } : {
      zIndex: zIndex
    }"
    @mousedown="emit('focus', id)"
  >
    <div class="title-bar" @mousedown="startDrag" @dblclick="toggleMaximize">
      <div class="traffic-lights" @mousedown.stop @dblclick.stop>
        <div class="light close" @click.stop="emit('close', id)" title="Close">
          <svg class="icon" viewBox="0 0 10 10" width="8" height="8">
            <path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <div class="light minimize" @click.stop="emit('minimize', id)" title="Minimize">
          <svg class="icon" viewBox="0 0 10 10" width="8" height="8">
            <path d="M1,5 L9,5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <div class="light maximize" @click.stop="toggleMaximize" title="Maximize">
          <svg class="icon" viewBox="0 0 10 10" width="8" height="8">
            <path d="M1,5 L9,5 M5,1 L5,9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
      </div>
      <div class="title">{{ title }}</div>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="resize-handle" @mousedown="startResize" v-if="!isMaximized"></div>
  </div>
</template>

<style scoped>
.window {
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.1);
  transition: box-shadow 0.2s, width 0.05s, height 0.05s, transform 0.05s;
  pointer-events: auto; /* Enable interactions */
}

.window.maximized {
  width: 100% !important;
  height: 100% !important;
  transform: translate(0, 0) !important;
  border-radius: 0;
  border: none;
  transition: all 0.3s ease;
}

.window.active {
  box-shadow: 0 25px 60px rgba(0,0,0,0.4);
  border-color: rgba(0,0,0,0.15);
}

.title-bar {
  height: 30px;
  background: #f0f0f0; /* Default inactive color */
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 10px;
  user-select: none;
  cursor: default;
  flex-shrink: 0;
}

.window.active .title-bar {
  background: linear-gradient(to bottom, #e8e8e8, #dcdcdc);
}

.traffic-lights {
  display: flex;
  gap: 8px;
  padding-left: 4px;
  z-index: 100;
  position: relative;
}

.light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.6);
  transition: transform 0.1s, filter 0.1s;
}

.icon {
  opacity: 0;
  transition: opacity 0.1s;
  display: block;
}

/* Show icons when hovering the title bar */
.title-bar:hover .icon {
  opacity: 1;
}

.close { background: #ff5f56; border: 1px solid #e0443e; }
.minimize { background: #ffbd2e; border: 1px solid #dea123; }
.maximize { background: #27c93f; border: 1px solid #1aab29; }

.light:active {
  filter: brightness(0.8);
  transform: scale(0.95);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin-right: 50px;
  opacity: 0.7;
}

.window.active .title {
  opacity: 1;
}

.content {
  flex: 1;
  padding: 0;
  overflow: auto;
  background: #fff;
  position: relative;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  cursor: nwse-resize;
  z-index: 10;
}

.window.transparent {
  background: transparent;
  border: none;
  box-shadow: none;
}

.window.transparent .content {
  background: transparent;
}

.window.transparent .title-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>
