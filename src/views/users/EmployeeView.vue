<script setup>
import { onMounted, ref } from 'vue'
import { useClaimStore } from '@/stores/employee-claims'
import WidthConstraint from '@/components/WidthConstraint.vue'

const claimStore = useClaimStore()
const claims = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    claims.value = await claimStore.fetchMyClaims()
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load claims.'
  } finally {
    loading.value = false
  }
})

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
</script>

<template>
  <WidthConstraint>
    <div class="mt-10 w-full">
      <div class="flex justify-end mb-8 w-full">
        <RouterLink
          to="/employee/claim/create"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-full font-bold shadow-lg transition-all duration-200 border-2 border-transparent hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Claim</span>
        </RouterLink>
      </div>
      <div v-if="loading" class="text-center py-10 text-lg text-gray-500">Loading claims...</div>
      <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>
      <div v-else-if="claims.length === 0" class="text-center py-10 text-gray-400">
        No claims found.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="claim in claims"
          :key="claim.id"
          class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-indigo-600 text-lg">{{ claim.name }}</span>
            <span class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{{
              claim.relation
            }}</span>
          </div>
          <div class="text-gray-700 mb-2">
            <span class="font-semibold">Department:</span> {{ claim.department }}
          </div>
          <div class="text-gray-700 mb-2">
            <span class="font-semibold">Amount:</span> ₵
            {{ claim.amount }}
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
                claim.document_url &&
                ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) =>
                  claim.document_url.toLowerCase().endsWith(ext),
                )
              "
            />
          </div>
          <div class="text-xs text-gray-400 mt-4">
            Submitted: {{ new Date(claim.created_at).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </WidthConstraint>
</template>
