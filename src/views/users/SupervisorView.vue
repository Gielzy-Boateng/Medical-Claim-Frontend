<script setup>
import { onMounted, ref } from 'vue'
import { useClaimStore } from '@/stores/employee-claims'
import WidthConstraint from '@/components/WidthConstraint.vue'
import ClaimCardList from '@/components/ClaimCardList.vue'

const claimStore = useClaimStore()
const claims = ref([])
const loading = ref(true)
const error = ref(null)

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
]
const activeTab = ref('all')

onMounted(async () => {
  loading.value = true
  try {
    claims.value = await claimStore.fetchSupervisorClaims()
    console.log('claims:', claims.value)
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load claims.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <WidthConstraint>
    <div class="mt-10 w-full">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 w-full gap-4">
        <div class="flex flex-row gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-4 py-2 rounded-full font-semibold border transition-all duration-150',
              activeTab === tab.value
                ? tab.value === 'pending'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow'
                  : tab.value === 'rejected'
                    ? 'bg-red-600 text-white border-red-700 shadow'
                    : 'bg-gray-700 text-white'
                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-10 text-lg text-gray-500">Loading claims...</div>
      <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>

      <div v-else>
        <ClaimCardList :claims="claims" :status="activeTab" :routeName="'supervisorClaimView'" />
      </div>
    </div>
  </WidthConstraint>
</template>
