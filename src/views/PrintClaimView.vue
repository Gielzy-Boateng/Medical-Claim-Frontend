<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading claim for printing...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-red-600 text-lg mb-4">{{ error }}</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>

    <div v-else-if="claim">
      <ClaimPrintView :claim="claim" :logoSrc="logoSrc" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClaimPrintView from '@/components/ClaimPrintView.vue'
import estateLogo from '@/assets/estate.jpg'

const route = useRoute()
const router = useRouter()
const claim = ref(null)
const loading = ref(true)
const error = ref(null)
const logoSrc = estateLogo

onMounted(async () => {
  loading.value = true
  const baseURL = import.meta.env.VITE_API_URL

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${baseURL}/api/post/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()

    if (res.ok) {
      claim.value = data
    } else {
      error.value = data.message || 'Failed to load claim'
    }
  } catch (e) {
    console.error('Error loading claim:', e)
    error.value = 'Network error occurred'
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>
