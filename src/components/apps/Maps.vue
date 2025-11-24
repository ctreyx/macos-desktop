<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
import { Style, Circle, Fill, Stroke } from 'ol/style'

const searchQuery = ref('')
const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let userLocationLayer: VectorLayer<VectorSource> | null = null
let routeLayer: VectorLayer<VectorSource> | null = null

// Navigation State
const isNavigating = ref(false)
const routeInfo = ref<{ distance: string, duration: string } | null>(null)
const startPoint = ref<[number, number] | null>(null) // Lon, Lat
const endPoint = ref<[number, number] | null>(null)   // Lon, Lat
const isSelectingEnd = ref(false)

const locations = [
  { name: 'Apple Park', coords: { lat: 37.3349, lon: -122.0090 }, type: '🏠', label: 'Home' },
  { name: 'San Francisco', coords: { lat: 37.7749, lon: -122.4194 }, type: '💼', label: 'Work' },
  { name: 'New York', coords: { lat: 40.7128, lon: -74.0060 }, type: '📍', label: 'New York' },
  { name: 'London', coords: { lat: 51.5074, lon: -0.1278 }, type: '📍', label: 'London' },
  { name: 'Tokyo', coords: { lat: 35.6762, lon: 139.6503 }, type: '📍', label: 'Tokyo' },
  { name: 'Paris', coords: { lat: 48.8566, lon: 2.3522 }, type: '📍', label: 'Paris' }
]

onMounted(() => {
  if (mapContainer.value) {
    map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([locations[0].coords.lon, locations[0].coords.lat]),
        zoom: 12
      })
    })

    // Initialize user location layer
    const source = new VectorSource()
    userLocationLayer = new VectorLayer({
      source: source,
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#3399CC' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        })
      })
    })
    
    // Initialize route layer
    const routeSource = new VectorSource()
    routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: '#007aff',
          width: 5
        })
      })
    })

    map.addLayer(routeLayer)
    map.addLayer(userLocationLayer)

    // Map click handler for destination selection
    map.on('click', (e) => {
      if (isSelectingEnd.value && map) {
        const coords = toLonLat(e.coordinate)
        endPoint.value = [coords[0], coords[1]]
        
        // Add marker for destination
        if (routeLayer) {
          const source = routeLayer.getSource()
          if (source) {
            // Clear previous destination markers but keep route if exists? No, clear all for new selection
            // Actually we should keep the route if we are just updating the point, but for simplicity clear first
            // source.clear() 
            
            // We will redraw everything in calculateRoute, but here just show the marker
            const feature = new Feature({
              geometry: new Point(e.coordinate)
            })
            feature.setStyle(new Style({
              image: new Circle({
                radius: 6,
                fill: new Fill({ color: '#FF3B30' }),
                stroke: new Stroke({ color: '#fff', width: 2 })
              })
            }))
            source.addFeature(feature)
          }
        }
        
        isSelectingEnd.value = false
        if (startPoint.value) {
          calculateRoute()
        }
      }
    })
  }
})

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined)
    map = null
  }
})

const startNavigationMode = () => {
  isNavigating.value = true
  isSelectingEnd.value = true
  // Try to get user location as start point
  getUserLocation(true)
}

const cancelNavigation = () => {
  isNavigating.value = false
  routeInfo.value = null
  startPoint.value = null
  endPoint.value = null
  if (routeLayer) {
    routeLayer.getSource()?.clear()
  }
}

const calculateRoute = async () => {
  if (!startPoint.value || !endPoint.value) return

  const start = startPoint.value
  const end = endPoint.value
  
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=polyline`
    )
    const data = await response.json()
    
    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0]
      const geometry = route.geometry
      const distance = (route.distance / 1000).toFixed(1) + ' km'
      const duration = Math.round(route.duration / 60) + ' min'
      
      routeInfo.value = { distance, duration }
      
      // Draw route
      if (routeLayer) {
        const source = routeLayer.getSource()
        if (source) {
          source.clear()
          
          // Add Start Point
          const startFeature = new Feature({
            geometry: new Point(fromLonLat(start))
          })
          startFeature.setStyle(new Style({
            image: new Circle({
              radius: 6,
              fill: new Fill({ color: '#34C759' }),
              stroke: new Stroke({ color: '#fff', width: 2 })
            })
          }))
          source.addFeature(startFeature)

          // Add End Point
          const endFeature = new Feature({
            geometry: new Point(fromLonLat(end))
          })
          endFeature.setStyle(new Style({
            image: new Circle({
              radius: 6,
              fill: new Fill({ color: '#FF3B30' }),
              stroke: new Stroke({ color: '#fff', width: 2 })
            })
          }))
          source.addFeature(endFeature)

          // Add Route Line
          const format = new Polyline({
            factor: 1e5
          })
          const routeFeature = format.readFeature(geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
          
          source.addFeature(routeFeature)
          
          // Fit view to route
          if (map) {
            const extent = source.getExtent()
            map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 })
          }
        }
      }
    }
  } catch (error) {
    console.error('Error calculating route:', error)
    alert('Failed to calculate route')
  }
}

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
</script>

<template>
  <div class="maps-container">
    <div class="sidebar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" placeholder="Search Maps" />
      </div>
      
      <div v-if="isNavigating" class="nav-panel">
        <div class="nav-header">
          <h3>Directions</h3>
          <button class="close-btn" @click="cancelNavigation">Done</button>
        </div>
        
        <div class="route-info" v-if="routeInfo">
          <div class="stat-card">
            <div class="stat-value">{{ (routeInfo as any)?.duration }}</div>
            <div class="stat-label">Est. Time</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ (routeInfo as any)?.distance }}</div>
            <div class="stat-label">Distance</div>
          </div>
        </div>
        <div class="instruction" v-else>
          <p>Select a destination on the map</p>
          <div class="loading" v-if="startPoint && endPoint">Calculating...</div>
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

        <div class="section-title">Favorites</div>
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

        <div class="section-title" style="margin-top: 15px;">Guides</div>
        <div 
          v-for="loc in locations.slice(2)" 
          :key="loc.name" 
          class="location-item"
          @click="flyToLocation(loc.coords)"
        >
          <span class="icon">{{ loc.type }}</span>
          <div class="info">
            <div class="name">{{ loc.label }}</div>
            <div class="sub">City Guide</div>
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
}

.sidebar {
  width: 260px;
  background: #f5f5f7;
  border-right: 1px solid #d2d2d7;
  display: flex;
  flex-direction: column;
  padding: 12px;
  z-index: 1; /* Ensure sidebar is above map if needed */
}

.search-bar {
  background: #e3e3e8;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.search-bar:focus-within {
  background: #fff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0,122,255,0.2);
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 13px;
  color: #333;
}

.search-icon {
  font-size: 12px;
  opacity: 0.5;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  margin-bottom: 5px;
  padding-left: 10px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.location-item:hover {
  background: rgba(0,0,0,0.05);
}

.icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
}

.sub {
  font-size: 11px;
  color: #86868b;
}

.map-view {
  flex: 1;
  background: #000;
  position: relative;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.action-buttons {
  padding: 0 10px 15px 10px;
}

.nav-start-btn {
  width: 100%;
  background: #007aff;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.nav-start-btn:hover {
  background: #0063ce;
}

.nav-panel {
  padding: 10px;
  background: #f5f5f7;
  height: 100%;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #007aff;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.route-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
}

.instruction {
  text-align: center;
  color: #86868b;
  font-size: 14px;
  margin-top: 40px;
}
</style>