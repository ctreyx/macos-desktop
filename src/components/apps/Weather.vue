<script setup lang="ts">
import { reactive, onMounted, computed, watch } from 'vue'
import WeatherIcon from './WeatherIcon.vue'
import { useI18n } from '../../composables/useI18n'

const { t, currentLang } = useI18n()

interface WeatherData {
  temperature: number
  windspeed: number
  winddirection: number
  weathercode: number
  time: string
}

const state = reactive({
  loading: true,
  error: null as string | null,
  weather: null as WeatherData | null,
  locationName: 'Locating...',
  coords: { lat: 0, lon: 0 }
})

const weatherCodes: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Drizzle: Light',
  53: 'Drizzle: Moderate',
  55: 'Drizzle: Dense intensity',
  61: 'Rain: Slight',
  63: 'Rain: Moderate',
  65: 'Rain: Heavy intensity',
  71: 'Snow fall: Slight',
  73: 'Snow fall: Moderate',
  75: 'Snow fall: Heavy intensity',
  95: 'Thunderstorm: Slight or moderate',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

const getBackgroundClass = computed(() => {
  if (!state.weather) return 'bg-default'
  const code = state.weather.weathercode
  if (code === 0) return 'bg-sunny'
  if (code >= 1 && code <= 3) return 'bg-cloudy'
  if (code >= 45 && code <= 48) return 'bg-fog'
  if (code >= 51 && code <= 67) return 'bg-rain'
  if (code >= 71 && code <= 77) return 'bg-snow'
  if (code >= 95 && code <= 99) return 'bg-thunder'
  return 'bg-default'
})

const fetchCityName = async (lat: number, lon: number) => {
  try {
    const lang = currentLang.value === 'zh' ? 'zh' : 'en'
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`)
    const data = await res.json()
    state.locationName = data.city || data.locality || data.principalSubdivision || 'Unknown Location'
  } catch (e) {
    state.locationName = `Lat: ${lat.toFixed(1)}, Lon: ${lon.toFixed(1)}`
  }
}

const fetchWeather = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
    const data = await response.json()
    state.weather = data.current_weather
    state.loading = false
    fetchCityName(lat, lon)
  } catch (e) {
    state.error = t('weather.error')
    state.loading = false
  }
}

const getLocation = () => {
  state.loading = true
  state.error = null
  
  if (!navigator.geolocation) {
    state.error = 'Geolocation is not supported'
    state.loading = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.coords = { lat: position.coords.latitude, lon: position.coords.longitude }
      fetchWeather(position.coords.latitude, position.coords.longitude)
    },
    () => {
      state.error = t('weather.error')
      state.loading = false
      // Default to London
      state.locationName = 'London'
      state.coords = { lat: 51.5074, lon: -0.1278 }
      fetchWeather(51.5074, -0.1278)
    }
  )
}

watch(currentLang, () => {
  if (state.coords.lat !== 0) {
    fetchCityName(state.coords.lat, state.coords.lon)
  }
})

onMounted(() => {
  getLocation()
})
</script>

<template>
  <div class="weather-app" :class="getBackgroundClass">
    <div v-if="state.loading" class="loading">
      <div class="spinner"></div>
      <p>{{ t('weather.loading') }}</p>
    </div>

    <div v-else-if="state.error" class="error">
      <p>⚠️ {{ state.error }}</p>
      <button @click="getLocation">{{ t('weather.retry') }}</button>
    </div>

    <div v-else-if="state.weather" class="weather-content">
      <div class="location-header">
        <h2>{{ state.locationName }}</h2>
        <p class="date">{{ t('weather.today') }}</p>
      </div>

      <div class="current-weather">
        <div class="icon-wrapper">
          <WeatherIcon :code="state.weather.weathercode" />
        </div>
        <div class="temp">{{ Math.round(state.weather.temperature) }}°</div>
        <div class="condition">{{ weatherCodes[state.weather.weathercode] || t('weather.unknown') }}</div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span class="label">{{ t('weather.wind') }}</span>
          <span class="value">{{ state.weather.windspeed }} <span class="unit">km/h</span></span>
        </div>
        <div class="detail-item">
          <span class="label">{{ t('weather.direction') }}</span>
          <span class="value">{{ state.weather.winddirection }}°</span>
        </div>
        <!-- Mocked data for layout completeness -->
        <div class="detail-item">
          <span class="label">{{ t('weather.humidity') }}</span>
          <span class="value">65 <span class="unit">%</span></span>
        </div>
        <div class="detail-item">
          <span class="label">{{ t('weather.feelsLike') }}</span>
          <span class="value">{{ Math.round(state.weather.temperature - 2) }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-app {
  height: 100%;
  width: 100%;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transition: background 1s ease;
  overflow: hidden;
  position: relative;
}

/* Dynamic Backgrounds */
.bg-default { background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); }
.bg-sunny { background: linear-gradient(180deg, #2980b9 0%, #6dd5fa 100%); }
.bg-cloudy { background: linear-gradient(180deg, #636fa4 0%, #e8cbc0 100%); }
.bg-rain { background: linear-gradient(180deg, #373b44 0%, #4286f4 100%); }
.bg-snow { background: linear-gradient(180deg, #83a4d4 0%, #b6fbff 100%); }
.bg-thunder { background: linear-gradient(180deg, #141e30 0%, #243b55 100%); }
.bg-fog { background: linear-gradient(180deg, #3e5151 0%, #decba4 100%); }

.loading, .error {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.weather-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 20px;
  box-sizing: border-box;
}

.location-header {
  text-align: center;
  animation: fadeInDown 0.8s ease-out;
}

.location-header h2 {
  font-size: 32px;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.date {
  font-size: 16px;
  opacity: 0.8;
  margin: 5px 0 0;
  font-weight: 400;
}

.current-weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  animation: fadeIn 1s ease-out;
}

.icon-wrapper {
  margin-bottom: 10px;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

.temp {
  font-size: 96px;
  font-weight: 200;
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.condition {
  font-size: 24px;
  font-weight: 500;
  margin-top: 10px;
  text-transform: capitalize;
  opacity: 0.9;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.8s ease-out;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
}

.label {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.value {
  font-size: 20px;
  font-weight: 500;
}

.unit {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 400;
}

button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>