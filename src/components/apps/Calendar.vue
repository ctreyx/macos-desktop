<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useLunar } from '../../composables/useLunar'

const { t, currentLang } = useI18n()
const { getFestival, getLunarDayText } = useLunar()

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const viewMode = ref<'month' | 'week' | 'day'>('month')
const direction = ref<'next' | 'prev'>('next')

const transitionName = computed(() => `slide-${direction.value}`)

const currentMonth = computed(() => {
  const monthIndex = currentDate.value.getMonth()
  return t('calendar.months')[monthIndex]
})

const currentYear = computed(() => currentDate.value.getFullYear())

const weekDays = computed(() => t('calendar.weekDays'))

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // Previous month padding
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push({ day: '', isCurrentMonth: false })
  }
  // Current month days
  for (let i = 1; i <= daysInMonth.value; i++) {
    const date = new Date(year, month, i)
    days.push({ 
      day: i, 
      isCurrentMonth: true,
      festival: getFestival(date),
      lunar: getLunarDayText(date)
    })
  }
  return days
})

const isToday = (day: number) => {
  const today = new Date()
  return day === today.getDate() &&
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
}

const prevMonth = () => {
  direction.value = 'prev'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  direction.value = 'next'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (day: number) => {
  selectedDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
}

// Keys for transitions
const monthKey = computed(() => `${currentDate.value.getFullYear()}-${currentDate.value.getMonth()}`)
const weekKey = computed(() => {
  const curr = new Date(currentDate.value)
  const first = curr.getDate() - curr.getDay()
  const d = new Date(curr)
  d.setDate(first)
  return d.toDateString()
})
const dayKey = computed(() => currentDate.value.toDateString())

// Scroll Handling
let scrollTimeout: any = null
const handleScroll = (e: WheelEvent) => {
  if (scrollTimeout) return
  
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null
  }, 100) // Debounce

  if (e.deltaY > 0) {
    // Scroll Down -> Next
    if (viewMode.value === 'month') nextMonth()
    else if (viewMode.value === 'week') nextWeek()
    else if (viewMode.value === 'day') nextDay()
  } else {
    // Scroll Up -> Prev
    if (viewMode.value === 'month') prevMonth()
    else if (viewMode.value === 'week') prevWeek()
    else if (viewMode.value === 'day') prevDay()
  }
}

// Week View Logic
const currentWeekDays = computed(() => {
  const curr = new Date(currentDate.value)
  const first = curr.getDate() - curr.getDay() // First day is the day of the month - the day of the week
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const next = new Date(curr.setDate(first + i))
    days.push({
      date: new Date(next),
      day: next.getDate(),
      festival: getFestival(next),
      lunar: getLunarDayText(next)
    })
    // Reset curr for next iteration because setDate mutates it
    curr.setTime(currentDate.value.getTime()) 
  }
  return days
})

const nextWeek = () => {
  direction.value = 'next'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() + 7)
}

const prevWeek = () => {
  direction.value = 'prev'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() - 7)
}

// Day View Logic
const nextDay = () => {
  direction.value = 'next'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() + 1)
}

const prevDay = () => {
  direction.value = 'prev'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), currentDate.value.getDate() - 1)
}

const currentDayInfo = computed(() => {
  const date = currentDate.value
  return {
    date: date,
    day: date.getDate(),
    festival: getFestival(date),
    lunar: getLunarDayText(date)
  }
})
</script>

<template>
  <div class="calendar-app">
    <div class="sidebar">
      <div class="mini-calendar">
        <div class="mini-header">
          <span>{{ currentMonth }} {{ currentYear }}</span>
          <div class="nav-buttons">
            <button @click="prevMonth">&lt;</button>
            <button @click="nextMonth">&gt;</button>
          </div>
        </div>
        <div class="mini-weekdays">
          <span v-for="day in weekDays" :key="day">{{ day[0] }}</span>
        </div>
        <div class="mini-grid">
          <div 
            v-for="(item, index) in calendarDays" 
            :key="index"
            class="mini-day"
            :class="{ 
              'empty': !item.isCurrentMonth,
              'today': item.isCurrentMonth && isToday(item.day as number),
              'selected': item.isCurrentMonth && item.day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth()
            }"
            @click="item.isCurrentMonth && selectDate(item.day as number)"
          >
            {{ item.day }}
          </div>
        </div>
      </div>
      
      <div class="calendars-list">
        <div class="section-title">iCloud</div>
        <div class="calendar-item">
          <span class="dot home"></span> {{ t('calendar.home') }}
        </div>
        <div class="calendar-item">
          <span class="dot work"></span> {{ t('calendar.work') }}
        </div>
        <div class="calendar-item">
          <span class="dot family"></span> {{ t('calendar.family') }}
        </div>
      </div>
    </div>

    <div class="main-view" @wheel="handleScroll">
      <div class="toolbar">
        <div class="view-title">{{ currentMonth }} {{ currentYear }}</div>
        <div class="view-options">
          <button :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">{{ t('calendar.month') }}</button>
          <button :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">{{ t('calendar.week') }}</button>
          <button :class="{ active: viewMode === 'day' }" @click="viewMode = 'day'">{{ t('calendar.day') }}</button>
        </div>
      </div>
      
      <div class="content-viewport">
        <Transition :name="transitionName">
          <div class="month-view view-content" v-if="viewMode === 'month'" :key="monthKey">
            <div class="weekdays-header">
              <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
            </div>
            <div class="days-grid">
              <div 
                v-for="(item, index) in calendarDays" 
                :key="index"
                class="day-cell"
                :class="{ 'other-month': !item.isCurrentMonth, 'today': item.isCurrentMonth && isToday(item.day as number) }"
              >
                <span v-if="item.isCurrentMonth" class="day-number">{{ item.day }}</span>
                <div v-if="item.isCurrentMonth" class="lunar-info">
                  <span v-if="item.festival" class="festival">{{ item.festival }}</span>
                  <span v-else class="lunar-date">{{ item.lunar }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="week-view view-content" v-else-if="viewMode === 'week'" :key="weekKey">
            <div class="week-grid">
              <div v-for="(day, index) in currentWeekDays" :key="index" class="week-day-col" :class="{ today: isToday(day.day) }">
                <div class="week-header">
                  <div class="weekday-name">{{ weekDays[index] }}</div>
                  <div class="day-number-large">{{ day.day }}</div>
                  <div class="lunar-info-week">
                    <span v-if="day.festival" class="festival">{{ day.festival }}</span>
                    <span v-else>{{ day.lunar }}</span>
                  </div>
                </div>
                <div class="time-slots">
                  <!-- Mock time slots -->
                  <div v-for="h in 24" :key="h" class="time-slot"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="day-view view-content" v-else-if="viewMode === 'day'" :key="dayKey">
            <div class="day-header">
              <div class="day-number-huge">{{ currentDayInfo.day }}</div>
              <div class="day-details">
                <div class="day-weekday">{{ weekDays[currentDayInfo.date.getDay()] }}</div>
                <div class="day-lunar">
                  <span v-if="currentDayInfo.festival" class="festival">{{ currentDayInfo.festival }}</span>
                  <span>{{ currentDayInfo.lunar }}</span>
                </div>
              </div>
            </div>
            <div class="day-schedule">
              <div v-for="h in 24" :key="h" class="schedule-hour">
                <span class="hour-label">{{ h - 1 }}:00</span>
                <div class="hour-line"></div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-app {
  display: flex;
  height: 100%;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.sidebar {
  width: 220px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.mini-calendar {
  margin-bottom: 20px;
}

.mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
}

.nav-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  padding: 0 5px;
}

.mini-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 10px;
  color: #888;
  margin-bottom: 5px;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  border-radius: 50%;
}

.mini-day:hover:not(.empty) {
  background: #e5e5e5;
}

.mini-day.today {
  background: #ff3b30;
  color: white;
}

.mini-day.selected:not(.today) {
  background: #333;
  color: white;
}

.calendars-list {
  margin-top: 20px;
}

.section-title {
  font-size: 11px;
  color: #888;
  font-weight: 600;
  margin-bottom: 5px;
}

.calendar-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 5px 0;
  color: #333;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot.home { background: #007aff; }
.dot.work { background: #34c759; }
.dot.family { background: #ff9500; }

.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 50px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.view-title {
  font-size: 20px;
  font-weight: 600;
}

.view-options {
  display: flex;
  background: #e5e5e5;
  border-radius: 6px;
  padding: 2px;
}

.view-options button {
  background: none;
  border: none;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.view-options button.active {
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.content-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.view-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* Slide Next */
.slide-next-enter-active,
.slide-next-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-next-enter-from {
  transform: translateX(100%);
}

.slide-next-leave-to {
  transform: translateX(-100%);
}

/* Slide Prev */
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-prev-enter-from {
  transform: translateX(-100%);
}

.slide-prev-leave-to {
  transform: translateX(100%);
}

.month-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: right;
  padding-right: 10px;
  margin-bottom: 5px;
}

.weekday {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 1fr;
  border-top: 1px solid #eee;
  border-left: 1px solid #eee;
}

.day-cell {
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 5px;
  text-align: right;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.day-cell.other-month {
  background: #fafafa;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
}

.day-cell.today .day-number {
  background: #ff3b30;
  color: white;
}

.lunar-info {
  margin-top: 2px;
  font-size: 10px;
  color: #999;
  text-align: right;
  width: 100%;
}

.festival {
  color: #ff3b30;
}

.day-cell.today .festival {
  color: #ff3b30; /* Keep red even if today */
}

.day-cell.today .lunar-date {
  color: rgba(255,255,255,0.9);
}

/* Week View Styles */
.week-view {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  min-height: 0;
}

.week-day-col {
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.week-header {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.week-day-col.today .week-header {
  background: #fff0f0;
}

.week-day-col.today .day-number-large {
  color: #ff3b30;
  font-weight: bold;
}

.day-number-large {
  font-size: 24px;
  margin: 5px 0;
}

.lunar-info-week {
  font-size: 11px;
  color: #888;
}

.time-slots {
  flex: 1;
  overflow-y: auto;
}

.time-slot {
  height: 40px;
  border-bottom: 1px solid #f5f5f5;
}

/* Day View Styles */
.day-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.day-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #eee;
}

.day-number-huge {
  font-size: 60px;
  font-weight: 300;
  color: #333;
}

.day-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.day-weekday {
  font-size: 24px;
  font-weight: 500;
}

.day-lunar {
  font-size: 16px;
  color: #666;
}

.day-schedule {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.schedule-hour {
  display: flex;
  height: 60px;
  align-items: flex-start;
}

.hour-label {
  width: 60px;
  color: #999;
  font-size: 12px;
  transform: translateY(-8px);
}

.hour-line {
  flex: 1;
  height: 1px;
  background: #eee;
}
</style>
