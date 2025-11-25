<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../composables/useI18n'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Polyline from 'ol/format/Polyline'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Stroke } from 'ol/style'

const { t } = useI18n()
const searchQuery = ref('')
const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let userLocationLayer: VectorLayer<VectorSource> | null = null
let routeLayer: VectorLayer<VectorSource> | null = null

// Navigation State
const isNavigating = ref(false)
const selectedMode = ref<'driving' | 'cycling' | 'walking'>('driving')
const routeInfo = ref<{
  distance: string,
  durations: { driving?: string, cycling?: string, walking?: string },
  arrivalTimes: { driving?: string, cycling?: string, walking?: string }
} | null>(null)
const routeGeometries = ref<{ driving?: string | null, cycling?: string | null, walking?: string | null }>({ driving: null, cycling: null, walking: null })
const startPoint = ref<[number, number] | null>(null) // Lon, Lat
const endPoint = ref<[number, number] | null>(null)   // Lon, Lat
const isSelectingEnd = ref(false)
const isCalculating = ref(false)

const flyToLocation = (coords: { lat: number, lon: number }) => {
  if (!map) return
  const view = map.getView()
  view.animate({
    center: fromLonLat([coords.lon, coords.lat]),
    zoom: 12,
    duration: 2000
  })
}

const getUserLocation = (isStartPoint = false) => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      
      if (isStartPoint) {
        startPoint.value = [longitude, latitude]
        if (endPoint.value) calculateRoute()
      }

      if (map && userLocationLayer) {
        const coords = fromLonLat([longitude, latitude])
        
        // Update user location feature
        const source = userLocationLayer.getSource()
        if (source) {
          source.clear()
          const feature = new Feature({
            geometry: new Point(coords)
          })
          source.addFeature(feature)
        }

        // Fly to user location only if not calculating route (to avoid conflict with fit extent)
        if (!isStartPoint || !endPoint.value) {
          const view = map.getView()
          view.animate({
            center: coords,
            zoom: 14,
            duration: 2000
          })
        }
      }
    },
    (error) => {
      console.error('Error getting location', error)
      alert('Unable to retrieve your location')
    }
  )
}

// re-calculate route when selected mode changes
watch(selectedMode, () => {
  const selected = selectedMode.value
  // if we already have the geometry, just redraw it; otherwise recalc
  if (routeGeometries.value[selected]) {
    drawRoute(routeGeometries.value[selected] || null, selected)
  } else if (startPoint.value && endPoint.value) {
    calculateRoute()
  }
})

// helper translations and constants
const OSRM_BASE = 'https://router.project-osrm.org'

const locations = [
  { name: 'home', label: 'Home', type: '🏠', coords: { lat: 37.7749, lon: -122.4194 } },
  { name: 'work', label: 'Work', type: '🏢', coords: { lat: 37.7936, lon: -122.3930 } },
  { name: 'museum', label: 'Museum', type: '🏛️', coords: { lat: 37.8000, lon: -122.4580 } },
  { name: 'park', label: 'Park', type: '🌳', coords: { lat: 37.7694, lon: -122.4862 } }
]

const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '--'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} ${t('maps.min')}`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return `${hrs} ${t('maps.hr')} ${rem} ${t('maps.min')}`
}

const getArrivalTime = (seconds: number) => {
  const d = new Date(Date.now() + (seconds * 1000))
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const fetchOsrmRoute = async (mode: 'driving' | 'cycling' | 'walking', start: [number, number], end: [number, number]) => {
  // Map internal modes to OSRM profiles: driving->driving, cycling->bike, walking->foot
  const profileMap: Record<string, string> = {
    driving: 'driving',
    cycling: 'bike',
    walking: 'foot'
  }
  const profile = profileMap[mode]
  const url = `${OSRM_BASE}/route/v1/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=polyline&steps=false&alternatives=false&annotations=duration,distance`
  const res = await fetch(url)
  if (!res.ok) throw new Error('OSRM error')
  const data = await res.json()
  if (!data.routes || !data.routes[0]) return null
  return {
    duration: data.routes[0].duration as number,
    distance: data.routes[0].distance as number,
    geometry: data.routes[0].geometry as string
  }
}

// Draw route on map based on mode
const drawRoute = (encoded: string | null, mode: 'driving' | 'cycling' | 'walking') => {
  if (!map || !routeLayer || !encoded) return
  const source = routeLayer.getSource()
  if (!source) return
  source.clear()
  const poly = new Polyline({ factor: 1e5 })
  const feat = poly.readFeature(encoded, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
  if (!feat) return
  // style
  let color = '#007aff'
  if (mode === 'cycling') color = '#FF9F0A'
  if (mode === 'walking') color = '#34C759'
  feat.setStyle(new Style({ stroke: new Stroke({ color, width: 6 }) }))
  source.addFeature(feat)
  // fit view
  const view = map.getView()
  const geom = feat.getGeometry()
  if (geom) {
    const extent = geom.getExtent()
    view.fit(extent, { padding: [40, 40, 40, 40], maxZoom: 16 })
  }
}

const calculateRoute = async () => {
  if (!startPoint.value || !endPoint.value) return
  isCalculating.value = true
  try {
    // OSRM expects lon,lat -> our refs are lon,lat
    const start = startPoint.value
    const end = endPoint.value
    const [dr, cy, wk] = await Promise.all([
      fetchOsrmRoute('driving', start, end).catch(() => null),
      fetchOsrmRoute('cycling', start, end).catch(() => null),
      fetchOsrmRoute('walking', start, end).catch(() => null)
    ])

    const durations: any = {}
    const arrivalTimes: any = {}
    const distanceMeters = dr?.distance || cy?.distance || wk?.distance || 0
  const distancestr = distanceMeters ? (distanceMeters < 1000 ? `${Math.round(distanceMeters)} m` : `${(distanceMeters / 1000).toFixed(1)} km`) : '--'

    if (dr) {
      durations.driving = formatDuration(dr.duration)
      arrivalTimes.driving = getArrivalTime(dr.duration)
      routeGeometries.value.driving = dr.geometry
    }
    if (cy) {
      durations.cycling = formatDuration(cy.duration)
      arrivalTimes.cycling = getArrivalTime(cy.duration)
      routeGeometries.value.cycling = cy.geometry
    }
    if (wk) {
      durations.walking = formatDuration(wk.duration)
      arrivalTimes.walking = getArrivalTime(wk.duration)
      routeGeometries.value.walking = wk.geometry
    }

    // Fallback approximations when OSRM doesn't provide a result
    const approx = (dist: number, speedKmh: number) => {
      if (!dist) return null
      const hours = dist / 1000 / speedKmh
      return Math.round(hours * 3600)
    }
    if (!dr && distanceMeters) {
      const approxSec = approx(distanceMeters, 50) || 0
      durations.driving = formatDuration(approxSec)
      arrivalTimes.driving = getArrivalTime(approxSec)
    }
    if (!cy && distanceMeters) {
      const approxSec = approx(distanceMeters, 15) || 0
      durations.cycling = formatDuration(approxSec)
      arrivalTimes.cycling = getArrivalTime(approxSec)
    }
    if (!wk && distanceMeters) {
      const approxSec = approx(distanceMeters, 5) || 0
      durations.walking = formatDuration(approxSec)
      arrivalTimes.walking = getArrivalTime(approxSec)
    }

    routeInfo.value = {
      distance: distancestr,
      durations,
      arrivalTimes
    }

    // Draw selected mode route geometry if available
    const selected = selectedMode.value
    if (selected === 'driving' && dr?.geometry) drawRoute(dr.geometry, 'driving')
    else if (selected === 'cycling' && cy?.geometry) drawRoute(cy.geometry, 'cycling')
    else if (selected === 'walking' && wk?.geometry) drawRoute(wk.geometry, 'walking')
    else {
      // draw whichever exists first
      const anyGeom = dr?.geometry || cy?.geometry || wk?.geometry
      if (anyGeom) drawRoute(anyGeom, selected)
    }
  } catch (err) {
    console.error('route error', err)
    alert('Failed to calculate route')
  } finally {
    isCalculating.value = false
  }
}

const startNavigationMode = () => {
  isNavigating.value = true
  isSelectingEnd.value = true
  // attempt to set start to user location
  getUserLocation(true)
}

const cancelNavigation = () => {
  isNavigating.value = false
  isSelectingEnd.value = false
  routeInfo.value = null
  // clear route drawing
  if (routeLayer && routeLayer.getSource()) routeLayer.getSource()!.clear()
}

onMounted(() => {
  // initialize map
  const tile = new TileLayer({ source: new OSM() })
  userLocationLayer = new VectorLayer({ source: new VectorSource() })
  routeLayer = new VectorLayer({ source: new VectorSource() })

  map = new Map({
    target: mapContainer.value || undefined,
    layers: [tile, routeLayer, userLocationLayer],
    view: new View({ center: fromLonLat([-122.4194, 37.7749]), zoom: 12 })
  })

  // map click handler for selecting end point when in navigation mode
  map.on('singleclick', (evt) => {
    if (!isNavigating.value) return
    const coords = toLonLat(evt.coordinate)
    // coords returns lon, lat; convert to [lon, lat]
    endPoint.value = [coords[0], coords[1]]
    isSelectingEnd.value = false
    calculateRoute()
  })
})

onUnmounted(() => {
  if (map) map.setTarget(undefined)
})
</script>

<template>
  <div class="maps-container">
    <div class="sidebar">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchQuery" :placeholder="t('maps.search')" />
          </div>
      
      <div v-if="isNavigating" class="nav-panel">
        <div class="nav-header">
          <div class="header-left">
            <h3>{{ t('maps.directions') }}</h3>
            <div v-if="isCalculating" class="spinner" aria-hidden="true" :title="t('maps.calculating')"></div>
          </div>
          <button class="close-btn" @click="cancelNavigation">{{ t('maps.done') }}</button>
        </div>

        <div class="mode-buttons">
          <button class="mode-btn" :class="{ active: selectedMode === 'driving' }" @click="selectedMode = 'driving'">🚗 {{ t('maps.drive') }}</button>
          <button class="mode-btn" :class="{ active: selectedMode === 'cycling' }" @click="selectedMode = 'cycling'">🚴 {{ t('maps.cycle') }}</button>
          <button class="mode-btn" :class="{ active: selectedMode === 'walking' }" @click="selectedMode = 'walking'">🚶 {{ t('maps.walk') }}</button>
        </div>
        
        <div class="route-info" v-if="routeInfo">
            <div class="mode-card mode-driving" :class="{ selected: selectedMode === 'driving' }" @click="selectedMode = 'driving'" @keyup.enter="selectedMode = 'driving'" role="button" tabindex="0" :aria-pressed="selectedMode === 'driving'" :title="t('maps.drive')">
            <div class="mode-icon">🚗</div>
            <div class="stat-value">{{ (routeInfo as any)?.durations.driving }}</div>
            <div class="stat-sub">{{ t('maps.drive') }}</div>
            <div class="stat-arrival">{{ t('maps.arrivalTime') }} • {{ (routeInfo as any)?.arrivalTimes.driving }}</div>
          </div>
          <div class="mode-card mode-cycling" :class="{ selected: selectedMode === 'cycling' }" @click="selectedMode = 'cycling'" @keyup.enter="selectedMode = 'cycling'" role="button" tabindex="0" :aria-pressed="selectedMode === 'cycling'" :title="t('maps.cycle')">
            <div class="mode-icon">🚴</div>
            <div class="stat-value">{{ (routeInfo as any)?.durations.cycling }}</div>
            <div class="stat-sub">{{ t('maps.cycle') }}</div>
            <div class="stat-arrival">{{ t('maps.arrivalTime') }} • {{ (routeInfo as any)?.arrivalTimes.cycling }}</div>
          </div>
          <div class="mode-card mode-walking" :class="{ selected: selectedMode === 'walking' }" @click="selectedMode = 'walking'" @keyup.enter="selectedMode = 'walking'" role="button" tabindex="0" :aria-pressed="selectedMode === 'walking'" :title="t('maps.walk')">
            <div class="mode-icon">🚶</div>
            <div class="stat-value">{{ (routeInfo as any)?.durations.walking }}</div>
            <div class="stat-sub">{{ t('maps.walk') }}</div>
            <div class="stat-arrival">{{ t('maps.arrivalTime') }} • {{ (routeInfo as any)?.arrivalTimes.walking }}</div>
          </div>
          <div class="stat-card distance-card">
            <div class="stat-value">{{ (routeInfo as any)?.distance }}</div>
            <div class="stat-label">{{ t('maps.distance') }}</div>
          </div>
        </div>
          <div class="instruction" v-else>
          <p>{{ t('maps.selectDest') }}</p>
          <div class="loading" v-if="isCalculating">{{ t('maps.calculating') }}</div>
        </div>
      </div>

      <div v-else>
        <div class="action-buttons">
          <button class="nav-start-btn" @click="startNavigationMode">
            <span class="icon">↗️</span> Directions
          </button>
        </div>

        <div class="location-item" @click="() => getUserLocation(false)">
          <span class="icon">📍</span>
          <div class="info">
            <div class="name">My Location</div>
            <div class="sub">Locate Me</div>
          </div>
        </div>

  <div class="section-title">{{ t('maps.favorites') }}</div>
        <div class="location-item" @click="flyToLocation(locations[0].coords)">
          <span class="icon">{{ locations[0].type }}</span>
          <div class="info">
            <div class="name">{{ locations[0].label }}</div>
            <div class="sub">{{ locations[0].name }}</div>
          </div>
        </div>
        <div class="location-item" @click="flyToLocation(locations[1].coords)">
          <span class="icon">{{ locations[1].type }}</span>
          <div class="info">
            <div class="name">{{ locations[1].label }}</div>
            <div class="sub">{{ locations[1].name }}</div>
          </div>
        </div>

  <div class="section-title" style="margin-top: 15px;">{{ t('maps.guides') }}</div>
        <div 
          v-for="loc in locations.slice(2)" 
          :key="loc.name" 
          class="location-item"
          @click="flyToLocation(loc.coords)"
        >
          <span class="icon">{{ loc.type }}</span>
          <div class="info">
            <div class="name">{{ loc.label }}</div>
              <div class="sub">{{ t('maps.cityGuide') }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="map-view">
      <div ref="mapContainer" class="map-container"></div>
    </div>
  </div>
</template>

<style scoped>
.maps-container {
  display: flex;
  height: 100%;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.sidebar {
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  z-index: 2;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
}

.search-bar {
  background: rgba(118, 118, 128, 0.12);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.search-bar:focus-within {
  background: #fff;
  box-shadow: 0 0 0 2px #007aff;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #1d1d1f;
}

.search-icon {
  font-size: 14px;
  opacity: 0.5;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  margin: 16px 0 8px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.location-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.sub {
  font-size: 12px;
  color: #86868b;
}

.map-view {
  flex: 1;
  background: #f5f5f7;
  position: relative;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.action-buttons {
  padding: 0 4px 12px 4px;
}

.nav-start-btn {
  width: 100%;
  background: #007aff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.nav-start-btn:hover {
  background: #0063ce;
}

.nav-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}

.close-btn {
  background: none;
  border: none;
  color: #007aff;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
  padding: 4px 8px;
  border-radius: 6px;
}

.close-btn:hover {
  background: rgba(0, 122, 255, 0.1);
}

/* Mode Buttons - Segmented Control */
.mode-buttons {
  display: flex;
  background: rgba(118, 118, 128, 0.12);
  padding: 2px;
  border-radius: 9px;
  margin-bottom: 20px;
}

.mode-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.mode-btn.active {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  font-weight: 600;
  color: #007aff;
}

/* Route Info Cards */
.route-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.mode-card {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.mode-card.selected {
  border-color: #007aff;
  background: #f0f7ff;
  box-shadow: 0 0 0 1px #007aff;
}

.mode-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1.2;
}

.stat-sub {
  font-size: 11px;
  color: #86868b;
  margin-top: 2px;
}

.stat-arrival {
  font-size: 10px;
  font-weight: 600;
  color: #1d1d1f;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Specific Mode Colors */
.mode-card.mode-driving.selected .mode-icon,
.mode-card.mode-driving.selected .stat-value { color: #007aff; }

.mode-card.mode-cycling.selected .mode-icon,
.mode-card.mode-cycling.selected .stat-value { color: #ff9500; }

.mode-card.mode-walking.selected .mode-icon,
.mode-card.mode-walking.selected .stat-value { color: #34c759; }

/* Distance Card */
.distance-card {
  grid-column: 1 / -1;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distance-card .stat-value {
  font-size: 16px;
  margin: 0;
}

.distance-card .stat-label {
  font-size: 13px;
  color: #86868b;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 122, 255, 0.1);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading {
  color: #86868b;
  font-size: 13px;
  margin-top: 16px;
  text-align: center;
}

.instruction {
  text-align: center;
  color: #86868b;
  font-size: 14px;
  margin-top: 40px;
  padding: 0 20px;
}

/* Responsive */
@media (max-width: 900px) {
  .sidebar { width: 100%; height: 40%; border-right: none; border-bottom: 1px solid #e6e9ee; }
  .maps-container { flex-direction: column-reverse; }
  .route-info { grid-template-columns: 1fr; }
  .mode-card {
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 16px;
    text-align: left;
  }
  .mode-icon { margin-bottom: 0; margin-right: 12px; font-size: 20px; }
  .stat-arrival {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
    width: auto;
    text-align: right;
  }
  .stat-value { font-size: 16px; }
}
</style>