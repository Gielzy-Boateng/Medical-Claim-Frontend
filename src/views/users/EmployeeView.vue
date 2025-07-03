<script setup>
import { ref, onMounted } from 'vue'
import { useClaimStore } from '@/stores/employee-claims'
import ClaimCardList from '@/components/ClaimCardList.vue'
import WidthConstraint from '@/components/WidthConstraint.vue'

const claimStore = useClaimStore()
const claims = ref({ pending: [], approved: [], rejected: [] })
const loading = ref(true)
const error = ref(null)

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]
const activeTab = ref('all')

// Fetch grouped claims on mount
onMounted(async () => {
  loading.value = true
  try {
    claims.value = await claimStore.fetchMyClaimsGrouped()
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load claims.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <WidthConstraint class="w-full mt-10 px-2 sm:px-4 md:px-8">
    <!-- Tab Switcher -->
    <div class="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        :class="[
          'px-5 py-2 rounded-full font-semibold border text-base transition-all duration-150 focus:outline-none',
          activeTab === tab.value
            ? tab.value === 'pending'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow'
              : tab.value === 'approved'
                ? 'bg-green-600 text-white border-green-700 shadow'
                : tab.value === 'rejected'
                  ? 'bg-red-600 text-white border-red-700 shadow'
                  : 'bg-gray-700 text-white'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="text-center py-16 text-xl text-gray-500 font-medium">
      Loading claims...
    </div>
    <div v-else-if="error" class="text-center py-16 text-xl text-red-500 font-medium">
      {{ error }}
    </div>

    <!-- Claims List -->
    <div v-else>
      <ClaimCardList
        :claims="
          activeTab === 'all'
            ? [...(claims.pending || []), ...(claims.approved || []), ...(claims.rejected || [])]
            : claims[activeTab] || []
        "
        :status="activeTab"
        :routeName="'employeeClaimView'"
      />
    </div>
  </WidthConstraint>
</template>
