<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  claims: Array,
  status: String,
  routeName: String,
})

const authStore = useAuthStore()

// Parse `description` to an array
function getExpenditureArray(desc) {
  if (Array.isArray(desc)) return desc
  if (typeof desc === 'string') {
    try {
      const arr = JSON.parse(desc)
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  return []
}

// Check if current user has acted on the claim
function getUserAction(claim) {
  if (!claim.flow_history || !authStore.user) return null
  let history =
    typeof claim.flow_history === 'string' ? JSON.parse(claim.flow_history) : claim.flow_history
  const entry = history.find((h) => h.by === authStore.user.id)
  return entry ? entry.action : null
}

//!! Filter claims by status
const filteredClaims = computed(() => {
  if (props.status === 'all') return props.claims
  return props.claims.filter(
    (claim) => (claim.status || '').toLowerCase() === props.status.toLowerCase(),
  )
})
</script>

<template>
  <div
    :class="[
      'w-full',
      filteredClaims.length === 1
        ? 'flex justify-center'
        : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6',
    ]"
  >
    <template v-if="filteredClaims.length === 0">
      <div class="w-full text-center py-10 text-gray-400 text-lg">
        <template v-if="props.status === 'pending'"> No pending claims. </template>
        <template v-else-if="props.status === 'approved'"> No approved claims. </template>
        <template v-else-if="props.status === 'rejected'"> No rejected claims. </template>
        <template v-else> No claims found. </template>
      </div>
    </template>
    <template v-else>
      <RouterLink
        v-for="claim in filteredClaims"
        :key="claim.id"
        :to="{ name: props.routeName, params: { id: claim.id } }"
        :class="filteredClaims.length === 1 ? 'max-w-lg w-full' : ''"
      >
        <div
          class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition mb-6"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex flex-col gap-1">
              <span class="font-bold text-indigo-600 text-lg">
                Beneficiary's Name: {{ claim.name }}
              </span>
              <span class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full w-fit">
                Relation: {{ claim.relation }}
              </span>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-xs text-gray-500 font-semibold">Total Amount</span>
              <span class="text-lg font-bold text-green-600">₵{{ claim.amount }}</span>
            </div>
          </div>

          <div class="text-gray-600 mb-2">
            <span class="font-semibold">Medical Expenditure:</span>
            <template v-if="getExpenditureArray(claim.description).length">
              <ul class="ml-4 mt-1 list-disc text-sm text-gray-700">
                <li v-for="(item, i) in getExpenditureArray(claim.description)" :key="i">
                  <span class="font-medium">{{ item.medicine }}</span>
                  <span v-if="item.price"> - ₵{{ item.price }}</span>
                </li>
              </ul>
            </template>
            <span v-else class="ml-4 text-gray-500">No expenditures</span>
          </div>

          <div v-if="claim.document_url" class="mt-2 flex flex-col gap-2">
            <a
              :href="claim.document_url"
              target="_blank"
              class="text-blue-600 underline hover:text-blue-800 mb-2"
            >
              View Document
            </a>
            <img
              :src="claim.document_url"
              alt="Claim Document"
              class="max-h-40 rounded border border-gray-200 object-contain bg-gray-50"
              v-if="
                ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) =>
                  claim.document_url.toLowerCase().endsWith(ext),
                )
              "
            />
          </div>

          <div class="flex items-center justify-between text-xs text-gray-400 mt-4">
            <span>Submitted: {{ new Date(claim.created_at).toLocaleString() }}</span>
            <span v-if="claim.user" class="flex flex-col items-end font-bold text-gray-700">
              <span>Submitted by: {{ claim.user.name }}</span>
              <span v-if="claim.department" class="text-xs font-normal text-gray-500 mt-0.5">
                ({{ claim.department }})
              </span>
            </span>
          </div>

          <span
            v-if="claim.user && claim.user.claim_total !== undefined"
            class="ml-3 text-indigo-700 font-semibold"
          >
            Remaining: ₵{{ Number(claim.user.claim_total).toLocaleString() }}
          </span>

          <!-- Status or Action Buttons -->
          <div class="mt-4">
            <template v-if="getUserAction(claim)">
              <span
                v-if="getUserAction(claim) === 'approved'"
                class="px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold border border-green-300"
                >Approved</span
              >
              <span
                v-else-if="getUserAction(claim) === 'rejected'"
                class="px-4 py-1 rounded-full bg-red-100 text-red-700 font-semibold border border-red-300"
                >Rejected</span
              >
              <span
                v-else
                class="px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold border border-yellow-300"
                >Pending</span
              >
            </template>
            <!-- No action buttons if user has already acted -->
          </div>
        </div>
      </RouterLink>
    </template>
  </div>
</template>
