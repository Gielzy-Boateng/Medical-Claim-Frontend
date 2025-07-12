<template>
  <div class="w-full max-w-6xl mx-auto p-6">
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Claims History</h2>
      <div class="mb-4 text-indigo-700 font-bold text-lg">
        Total Claimed: ₵{{ totalAmount.toLocaleString() }}
      </div>

      <!-- Search and Filter -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by beneficiary name or employee..."
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            v-model="actionFilter"
            class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Claims List -->
      <div class="space-y-4">
        <div
          v-for="claim in filteredClaims"
          :key="claim.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 text-lg">{{ claim.name }}</h3>
              <p class="text-sm text-gray-600">{{ claim.email || 'No email' }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {{ claim.relation }}
                </span>
                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ₵{{ claim.amount }}
                </span>
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="getStatusBadgeClass(claim.status)"
                >
                  {{ claim.status }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Submitted by</p>
              <p class="font-medium">{{ claim.user?.name || 'Unknown' }}</p>
              <p class="text-xs text-gray-400">{{ claim.department }}</p>
            </div>
          </div>

          <!-- My Action on This Claim -->
          <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-blue-800 mb-2">My Action on This Claim</h4>
            <div v-if="getMyAction(claim)" class="flex items-center gap-2">
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  getMyAction(claim).action === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ getMyAction(claim).action === 'approved' ? '✅ Approved' : '❌ Rejected' }}
              </span>
              <span class="text-sm text-gray-600">
                on {{ new Date(getMyAction(claim).at).toLocaleString() }}
              </span>
              <span v-if="getMyAction(claim).reason" class="text-sm text-gray-600">
                - {{ getMyAction(claim).reason }}
              </span>
            </div>
            <div v-else class="text-sm text-gray-500">No action taken yet</div>
          </div>

          <!-- Full Timeline -->
          <div class="border-t pt-4">
            <h4 class="font-semibold text-gray-800 mb-3">Complete Timeline</h4>
            <ClaimProgressTimeline :claim="claim" />
          </div>

          <!-- View Details Button -->
          <div class="mt-4 flex justify-end">
            <RouterLink
              :to="{ name: getRouteName(), params: { id: claim.id } }"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              View Details
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredClaims.length === 0" class="text-center py-8">
        <div class="text-gray-400 text-lg">
          <template v-if="searchQuery || statusFilter || actionFilter">
            No claims match your filters
          </template>
          <template v-else> No claims handled yet </template>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ClaimProgressTimeline from '@/components/ClaimProgressTimeline.vue'

const authStore = useAuthStore()
const claims = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const actionFilter = ref('')

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getMyAction = (claim) => {
  if (!claim.flow_history) return null

  let history = claim.flow_history
  if (typeof history === 'string') {
    try {
      history = JSON.parse(history)
    } catch {
      return null
    }
  }

  if (!Array.isArray(history)) return null

  return history.find((event) => event.by === authStore.user?.id)
}

const getRouteName = () => {
  const role = authStore.user?.role
  const routeMap = {
    supervisor: 'supervisorClaimView',
    manager: 'managerClaimView',
    hr: 'hrClaimView',
    account: 'accountClaimView',
  }
  return routeMap[role] || 'employeeClaimView'
}

const filteredClaims = computed(() => {
  let filtered = claims.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (claim) =>
        claim.name.toLowerCase().includes(query) ||
        claim.user?.name.toLowerCase().includes(query) ||
        claim.email?.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((claim) => claim.status === statusFilter.value)
  }

  // Action filter
  if (actionFilter.value) {
    filtered = filtered.filter((claim) => {
      const myAction = getMyAction(claim)
      return myAction && myAction.action === actionFilter.value
    })
  }

  return filtered
})

const totalAmount = computed(() => {
  return filteredClaims.value.reduce((sum, claim) => sum + Number(claim.amount || 0), 0)
})

const fetchHandledClaims = async () => {
  loading.value = true
  error.value = ''
  const baseURL = import.meta.env.VITE_API_URL

  try {
    const res = await fetch(`${baseURL}/api/my-handled-claims`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    const data = await res.json()

    if (res.ok) {
      claims.value = data.data || []
    } else {
      error.value = data.message || 'Failed to fetch handled claims'
    }
  } catch (err) {
    console.error('Error fetching handled claims:', err)
    error.value = 'Network error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHandledClaims()
})
</script>
