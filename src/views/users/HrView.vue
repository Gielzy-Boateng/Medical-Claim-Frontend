<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClaimStore } from '@/stores/employee-claims'
import WidthConstraint from '@/components/WidthConstraint.vue'
import ClaimCardList from '@/components/ClaimCardList.vue'
import RoleManagement from '@/components/RoleManagement.vue'
import ClaimsHistory from '@/components/ClaimsHistory.vue'

const route = useRoute()
const router = useRouter()
const claimStore = useClaimStore()
const groupedClaims = ref({ pending: [], approved: [], rejected: [] })
const loading = ref(true)
const error = ref(null)

const tabs = [
  { id: 'claims', name: 'Claims Management' },
  { id: 'history', name: 'History' },
  { id: 'role-management', name: 'Role Management' },
]

// Sub-tabs for claims
const claimSubTabs = [
  { id: 'all', name: 'All Claims' },
  { id: 'pending', name: 'Pending' },
  { id: 'rejected', name: 'Rejected' },
]

// Initialize tabs from URL query parameters or defaults
const activeTab = ref(route.query.mainTab || 'claims')
const activeClaimSubTab = ref(route.query.subTab || 'all')

// Watch for tab changes and update URL
watch(activeTab, (newTab) => {
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
    return [
      ...groupedClaims.value.pending,
      ...groupedClaims.value.approved,
      ...groupedClaims.value.rejected,
    ]
  }
  return groupedClaims.value[activeClaimSubTab.value] || []
})

onMounted(async () => {
  loading.value = true
  try {
    // Fetch all HR claims (this gets all claims that have reached HR stage)
    const allClaims = await claimStore.fetchHrClaims()

    // Group the claims by status
    groupedClaims.value = {
      pending: allClaims.filter((claim) => claim.status === 'pending'),
      approved: allClaims.filter((claim) => claim.status === 'approved'),
      rejected: allClaims.filter((claim) => claim.status === 'rejected'),
    }

    console.log('Grouped claims:', groupedClaims.value)
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
        <h1 class="text-3xl font-bold text-gray-800 mb-8">HR Dashboard</h1>

        <!-- Main Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
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
        <div v-if="activeTab === 'claims'">
          <!-- Claims Sub-tabs -->
          <div class="mb-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-6">
                <button
                  v-for="subTab in claimSubTabs"
                  :key="subTab.id"
                  @click="activeClaimSubTab = subTab.id"
                  :class="[
                    'py-2 px-1 border-b-2 font-medium text-sm',
                    activeClaimSubTab === subTab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  ]"
                >
                  {{ subTab.name }}
                  <span class="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {{
                      subTab.id === 'all'
                        ? currentClaims.length
                        : groupedClaims[subTab.id]?.length || 0
                    }}
                  </span>
                </button>
              </nav>
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
              :routeName="'hrClaimView'"
            />
          </div>
        </div>

        <div v-else-if="activeTab === 'history'">
          <ClaimsHistory />
        </div>

        <div v-else-if="activeTab === 'role-management'">
          <RoleManagement />
        </div>
      </div>
    </WidthConstraint>
  </div>
</template>
