import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Review, DailyStats } from '../types'
import { api } from '../api'

export const useReviewStore = defineStore('reviews', () => {
  const review = ref<Review | null>(null)
  const stats = ref<DailyStats | null>(null)

  async function fetchByDate(date: string) {
    review.value = await api.reviews.getByDate(date) || null
    stats.value = await api.stats.getDaily(date)
  }

  async function saveReview(date: string, content: string) {
    review.value = await api.reviews.save(date, content)
  }

  return { review, stats, fetchByDate, saveReview }
})
