<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClaimStore } from '@/stores/employee-claims'
import WidthConstraint from '@/components/WidthConstraint.vue'
import ClaimCardList from '@/components/ClaimCardList.vue'
import ClaimsHistory from '@/components/ClaimsHistory.vue'

const route = useRoute()
const router = useRouter()
const claimStore = useClaimStore()
const claims = ref([])
const loading = ref(true)
const error = ref(null)

const mainTabs = [
  { id: 'claims', name: 'Claims Management' },
  { id: 'history', name: 'History' },
]

const claimSubTabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

// Initialize tabs from URL query parameters or defaults
const activeMainTab = ref(route.query.mainTab || 'claims')
const activeClaimSubTab = ref(route.query.subTab || 'all')

// Watch for tab changes and update URL
watch(activeMainTab, (newTab) => {
  updateUrl({ mainTab: newTab })
})

watch(activeClaimSubTab, (newSubTab) => {
  updateUrl({ subTab: newSubTab })
})

function updateUrl(params) {
  const newQuery = { ...route.query, ...params }
  router.replace({ query: newQuery })
}

// Computed property to get the current claims based on sub-tab
const currentClaims = computed(() => {
  if (activeClaimSubTab.value === 'all') {
    return claims.value
  }
  return claims.value.filter((claim) => claim.status === activeClaimSubTab.value)
})

// Computed properties for claim counts
const claimCounts = computed(() => ({
  all: claims.value.length,
  pending: claims.value.filter((claim) => claim.status === 'pending').length,
  approved: claims.value.filter((claim) => claim.status === 'approved').length,
  rejected: claims.value.filter((claim) => claim.status === 'rejected').length,
}))

onMounted(async () => {
  loading.value = true
  try {
    claims.value = await claimStore.fetchAccountClaims()
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
  <div class="min-h-screen bg-gray-50">
    <WidthConstraint>
      <div class="py-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Account Dashboard</h1>

        <!-- Main Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                v-for="tab in mainTabs"
                :key="tab.id"
                @click="activeMainTab = tab.id"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeMainTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div v-if="activeMainTab === 'claims'">
          <!-- Claims Sub-tabs -->
          <div class="mb-6">
            <div class="flex flex-row gap-2">
              <button
                v-for="tab in claimSubTabs"
                :key="tab.value"
                @click="activeClaimSubTab = tab.value"
                :class="[
                  'px-4 py-2 rounded-full font-semibold border transition-all duration-150',
                  activeClaimSubTab === tab.value
                    ? tab.value === 'pending'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow'
                      : tab.value === 'approved'
                        ? 'bg-green-600 text-white border-green-700 shadow'
                        : tab.value === 'rejected'
                          ? 'bg-red-600 text-white border-red-700 shadow'
                          : 'bg-gray-700 text-white'
                    : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50',
                ]"
              >
                {{ tab.label }}
                <span class="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 rounded-full">
                  {{ claimCounts[tab.value] }}
                </span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-gray-600">Loading claims...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <p class="text-red-600">{{ error }}</p>
          </div>

          <!-- Claims List -->
          <div v-else>
            <ClaimCardList
              :claims="currentClaims"
              :status="activeClaimSubTab"
              :routeName="'accountClaimView'"
            />
          </div>
        </div>

        <div v-else-if="activeMainTab === 'history'">
          <ClaimsHistory />
        </div>
      </div>
    </WidthConstraint>
  </div>
</template>
