<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClaimStore } from '@/stores/employee-claims'
import ClaimCardList from '@/components/ClaimCardList.vue'
import WidthConstraint from '@/components/WidthConstraint.vue'

const route = useRoute()
const router = useRouter()
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

// Initialize tab from URL query parameter or default
const activeTab = ref(route.query.tab || 'all')

// Watch for tab changes and update URL
watch(activeTab, (newTab) => {
  updateUrl({ tab: newTab })
})

function updateUrl(params) {
  const newQuery = { ...route.query, ...params }
  router.replace({ query: newQuery })
}

// Computed properties for claim counts
const claimCounts = computed(() => ({
  all:
    (claims.value.pending || []).length +
    (claims.value.approved || []).length +
    (claims.value.rejected || []).length,
  pending: (claims.value.pending || []).length,
  approved: (claims.value.approved || []).length,
  rejected: (claims.value.rejected || []).length,
}))

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
    <!-- Tab Switcher and Create Button -->
    <div class="flex flex-wrap gap-2 mb-8 items-center justify-between w-full">
      <div class="flex flex-wrap gap-2">
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
          <span class="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 rounded-full">
            {{ claimCounts[tab.value] }}
          </span>
        </button>
      </div>
      <router-link
        to="/employee/claim/create"
        class="ml-auto bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold px-6 py-2 rounded-full shadow transition-all duration-200 border-2 border-transparent hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      >
        + Create Claim
      </router-link>
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
