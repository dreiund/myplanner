import { defineStore } from 'pinia'
import { ref } from 'vue'
import { today } from '../utils/date'

export const useCalendarStore = defineStore('calendar', () => {
  const selectedDate = ref(today())
  const viewMode = ref<'month' | 'week' | 'day'>('month')
  const currentYear = ref(new Date().getFullYear())
  const currentMonth = ref(new Date().getMonth() + 1)

  function setSelectedDate(date: string) { selectedDate.value = date }
  function setViewMode(mode: 'month' | 'week' | 'day') { viewMode.value = mode }
  function nextMonth() {
    if (currentMonth.value === 12) { currentYear.value++; currentMonth.value = 1 }
    else currentMonth.value++
  }
  function prevMonth() {
    if (currentMonth.value === 1) { currentYear.value--; currentMonth.value = 12 }
    else currentMonth.value--
  }
  function goToday() {
    currentYear.value = new Date().getFullYear()
    currentMonth.value = new Date().getMonth() + 1
    selectedDate.value = today()
  }

  return { selectedDate, viewMode, currentYear, currentMonth, setSelectedDate, setViewMode, nextMonth, prevMonth, goToday }
})
