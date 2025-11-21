<script setup lang="ts">
const props = defineProps<{
  code: number
  isDay?: boolean
}>()

// Map WMO weather codes to icon types
const getIconType = () => {
  const c = props.code
  if (c === 0) return 'sun'
  if (c >= 1 && c <= 3) return 'cloud-sun'
  if (c >= 45 && c <= 48) return 'fog'
  if (c >= 51 && c <= 67) return 'rain'
  if (c >= 71 && c <= 77) return 'snow'
  if (c >= 80 && c <= 82) return 'rain'
  if (c >= 95 && c <= 99) return 'thunder'
  return 'sun'
}
</script>

<template>
  <div class="weather-icon-container">
    <!-- Sunny -->
    <div v-if="getIconType() === 'sun'" class="icon sun">
      <div class="sun-body"></div>
      <div class="sun-rays"></div>
    </div>

    <!-- Cloudy / Partly Cloudy -->
    <div v-else-if="getIconType() === 'cloud-sun'" class="icon cloud-sun">
      <div class="sun-small"></div>
      <div class="cloud"></div>
    </div>

    <!-- Rain -->
    <div v-else-if="getIconType() === 'rain'" class="icon rain">
      <div class="cloud dark"></div>
      <div class="rain-drops">
        <div class="drop"></div>
        <div class="drop"></div>
        <div class="drop"></div>
      </div>
    </div>

    <!-- Snow -->
    <div v-else-if="getIconType() === 'snow'" class="icon snow">
      <div class="cloud dark"></div>
      <div class="snow-flakes">
        <div class="flake">❄</div>
        <div class="flake">❄</div>
      </div>
    </div>

    <!-- Thunder -->
    <div v-else-if="getIconType() === 'thunder'" class="icon thunder">
      <div class="cloud dark"></div>
      <div class="lightning">⚡</div>
    </div>

    <!-- Fog -->
    <div v-else-if="getIconType() === 'fog'" class="icon fog">
      <div class="cloud"></div>
      <div class="fog-lines">
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-icon-container {
  width: 120px;
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Sun Animation */
.sun-body {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #ffd700, #ff8c00);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  z-index: 2;
}
.sun-rays {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 215, 0, 0.3);
  animation: spin 10s linear infinite;
}

/* Cloud Animation */
.cloud {
  width: 80px;
  height: 40px;
  background: #fff;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: float 3s ease-in-out infinite;
  z-index: 2;
}
.cloud::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 10px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
}
.cloud::after {
  content: '';
  position: absolute;
  top: -15px;
  right: 10px;
  width: 35px;
  height: 35px;
  background: #fff;
  border-radius: 50%;
}
.cloud.dark {
  background: #d1d5db;
}
.cloud.dark::before, .cloud.dark::after {
  background: #d1d5db;
}

/* Cloud Sun */
.cloud-sun .sun-small {
  width: 40px;
  height: 40px;
  background: #ffd700;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
  animation: spin 20s linear infinite;
}
.cloud-sun .cloud {
  animation: float 4s ease-in-out infinite;
}

/* Rain */
.rain-drops {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
.drop {
  width: 4px;
  height: 10px;
  background: #60a5fa;
  border-radius: 2px;
  animation: rain 1s linear infinite;
}
.drop:nth-child(2) { animation-delay: 0.3s; }
.drop:nth-child(3) { animation-delay: 0.6s; }

/* Snow */
.snow-flakes {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
}
.flake {
  display: inline-block;
  color: white;
  font-size: 20px;
  animation: snow 3s linear infinite;
}
.flake:nth-child(2) { animation-delay: 1.5s; }

/* Thunder */
.lightning {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  animation: flash 2s infinite;
}

/* Fog */
.fog-lines {
  position: absolute;
  bottom: 20px;
  width: 80px;
}
.line {
  height: 4px;
  background: rgba(255,255,255,0.6);
  margin: 4px 0;
  border-radius: 2px;
  animation: fog 3s ease-in-out infinite;
}

/* Keyframes */
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes rain { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }
@keyframes snow { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(20px) rotate(180deg); opacity: 0; } }
@keyframes flash { 0%, 90%, 100% { opacity: 0; } 92%, 96% { opacity: 1; } }
@keyframes fog { 0%, 100% { opacity: 0.5; transform: translateX(0); } 50% { opacity: 1; transform: translateX(5px); } }
</style>