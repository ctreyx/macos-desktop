<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
// Default to Apple Park area
const mapUrl = ref('https://www.openstreetmap.org/export/embed.html?bbox=-122.015,37.330,-122.003,37.340&layer=mapnik')

const locations = [
  { name: 'Apple Park', coords: '-122.015,37.330,-122.003,37.340', type: '🏠', label: 'Home' },
  { name: 'San Francisco', coords: '-122.52,37.70,-122.35,37.81', type: '💼', label: 'Work' },
  { name: 'New York', coords: '-74.02,40.68,-73.93,40.76', type: '📍', label: 'New York' },
  { name: 'London', coords: '-0.15,51.48,0.00,51.52', type: '📍', label: 'London' },
  { name: 'Tokyo', coords: '139.69,35.67,139.81,35.71', type: '📍', label: 'Tokyo' },
  { name: 'Paris', coords: '2.25,48.81,2.42,48.90', type: '📍', label: 'Paris' }
]

const setLocation = (coords: string) => {
  mapUrl.value = `https://www.openstreetmap.org/export/embed.html?bbox=${coords}&layer=mapnik`
}
</script>

<template>
  <div class="maps-container">
    <div class="sidebar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" placeholder="Search Maps" />
      </div>
      
      <div class="section-title">Favorites</div>
      <div class="location-item" @click="setLocation(locations[0].coords)">
        <span class="icon">{{ locations[0].type }}</span>
        <div class="info">
          <div class="name">{{ locations[0].label }}</div>
          <div class="sub">{{ locations[0].name }}</div>
        </div>
      </div>
      <div class="location-item" @click="setLocation(locations[1].coords)">
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
        @click="setLocation(loc.coords)"
      >
        <span class="icon">{{ loc.type }}</span>
        <div class="info">
          <div class="name">{{ loc.label }}</div>
          <div class="sub">City Guide</div>
        </div>
      </div>
    </div>
    <div class="map-view">
      <iframe 
        width="100%" 
        height="100%" 
        frameborder="0" 
        scrolling="no" 
        marginheight="0" 
        marginwidth="0" 
        :src="mapUrl"
        title="OpenStreetMap"
      ></iframe>
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
  background: #e5e3df;
  position: relative;
}

iframe {
  display: block;
}
</style>