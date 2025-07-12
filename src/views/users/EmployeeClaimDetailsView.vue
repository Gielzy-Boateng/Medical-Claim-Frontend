<script setup>
import WidthConstraint from '@/components/WidthConstraint.vue'
import ClaimProgressTimeline from '@/components/ClaimProgressTimeline.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const claim = ref(null)
const loading = ref(true)
const error = ref(null)
const showTimeline = ref(false)

onMounted(async () => {
  loading.value = true
  const baseURL = import.meta.env.VITE_API_URL

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${baseURL}/api/post/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    claim.value = data
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load claim details.'
  } finally {
    loading.value = false
  }
})

function parseDescription(desc) {
  try {
    const arr = JSON.parse(desc)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
</script>

<template>
  <WidthConstraint
    class="mt-10 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 relative"
  >
    <button
      class="absolute left-6 top-6 z-20 flex items-center gap-2 px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full shadow border border-gray-300 text-base font-semibold transition"
      @click="router.back()"
      title="Go Back"
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
    <div v-if="loading" class="text-center py-10 text-lg text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>
    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold text-indigo-700 text-center w-full">
          Claim by {{ claim.user?.name || 'Unknown User' }}
        </h2>
        <div class="flex items-center space-x-6">
          <span
            v-if="claim.status"
            :class="[
              'px-4 py-1 rounded-full text-base font-semibold shadow border ml-4',
              claim.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : '',
              claim.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : '',
              claim.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : '',
            ]"
          >
            {{ claim.status.charAt(0).toUpperCase() + claim.status.slice(1) }}
          </span>
          <button
            class="text-nowrap bg-blue-500 rounded-full px-4 py-1 text-white text-base font-semibold shadow border"
            @click="showTimeline = true"
          >
            View Timeline
          </button>
        </div>
        <!-- Timeline Dialog -->
        <transition name="fade">
          <div
            v-if="showTimeline"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div
              class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn"
            >
              <button
                @click="showTimeline = false"
                class="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
              <ClaimProgressTimeline :claim="claim" />
            </div>
          </div>
        </transition>
      </div>
      <div v-if="claim.document_url" class="flex flex-col items-center mb-10">
        <a :href="claim.document_url" target="_blank" class="block w-full">
          <img
            :src="claim.document_url"
            alt="Claim Document"
            class="w-full max-h-[400px] object-contain rounded-2xl border border-gray-200 bg-gray-50 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
          />
        </a>
        <span class="text-sm text-gray-400 mt-2">Tap image to view full size</span>
      </div>
      <table class="w-full border-2 border-gray-400 rounded-lg text-base mb-8 border-collapse">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-3 border-2 border-gray-400 text-center font-semibold">
              Beneficiary Name
            </th>
            <th class="px-3 py-3 border-2 border-gray-400 text-center font-semibold">Dept</th>
            <th class="px-3 py-3 border-2 border-gray-400 text-center font-semibold">
              Relation to Employee
            </th>
            <th class="px-3 py-3 border-2 border-gray-400 text-center font-semibold">Date</th>
            <th class="px-3 py-3 border-2 border-gray-400 text-center font-semibold">Items</th>
            <th class="px-3 py-3 border-2 border-gray-400 text-center font-semibold">Price (₵)</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-if="
              (Array.isArray(claim.description) && claim.description.length) ||
              (typeof claim.description === 'string' && parseDescription(claim.description).length)
            "
          >
            <tr
              v-for="(item, i) in Array.isArray(claim.description)
                ? claim.description
                : parseDescription(claim.description)"
              :key="i"
              class="border-b border-gray-400"
            >
              <td
                class="px-3 py-3 border-r border-gray-400 text-lg text-center"
                v-if="i === 0"
                :rowspan="
                  Array.isArray(claim.description)
                    ? claim.description.length
                    : parseDescription(claim.description).length
                "
              >
                {{ claim.name || claim.beneficiary_name || claim.user?.name || 'N/A' }}
              </td>
              <td
                class="px-3 py-3 border-r border-gray-400 text-lg text-center"
                v-if="i === 0"
                :rowspan="
                  Array.isArray(claim.description)
                    ? claim.description.length
                    : parseDescription(claim.description).length
                "
              >
                {{ claim.department || claim.user?.department || 'N/A' }}
              </td>
              <td
                class="px-3 py-3 border-r border-gray-400 text-lg text-center"
                v-if="i === 0"
                :rowspan="
                  Array.isArray(claim.description)
                    ? claim.description.length
                    : parseDescription(claim.description).length
                "
              >
                {{ claim.relation || 'N/A' }}
              </td>
              <td
                class="px-3 py-3 border-r border-gray-400 text-lg text-center"
                v-if="i === 0"
                :rowspan="
                  Array.isArray(claim.description)
                    ? claim.description.length
                    : parseDescription(claim.description).length
                "
              >
                {{ claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A' }}
              </td>
              <td class="px-3 py-3 border-r border-gray-400 text-center">{{ item.medicine }}</td>
              <td class="px-3 py-3 border-gray-400 text-center">{{ item.price }}</td>
            </tr>
            <tr class="border-t-2 border-green-200">
              <td colspan="4" class="border-t border-gray-400"></td>
              <td class="px-3 py-3 font-bold bg-green-50 text-center border-t border-gray-400">
                Total
              </td>
              <td
                class="px-3 py-3 font-bold text-green-700 bg-green-50 text-center border-t border-gray-400"
              >
                ₵{{ claim.amount }}
              </td>
            </tr>
          </template>
          <tr v-else class="border-b border-gray-400">
            <td class="px-3 py-3 border-r border-gray-400 text-lg text-center">
              {{ claim.name || claim.beneficiary_name || claim.user?.name || 'N/A' }}
            </td>
            <td class="px-3 py-3 border-r border-gray-400 text-lg text-center">
              {{ claim.department || claim.user?.department || 'N/A' }}
            </td>
            <td class="px-3 py-3 border-r border-gray-400 text-lg text-center">
              {{ claim.relation || 'N/A' }}
            </td>
            <td class="px-3 py-3 border-r border-gray-400 text-lg text-center">
              {{ claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A' }}
            </td>
            <td class="px-3 py-3 border-r border-gray-400 text-gray-400 text-center" colspan="2">
              No expenditures
            </td>
          </tr>
          <tr class="border-t-2 border-indigo-300 bg-indigo-50">
            <td
              colspan="5"
              class="px-3 py-3 font-bold text-indigo-700 text-left border-t-2 border-gray-400"
            >
              Remaining Claim Amount
            </td>
            <td class="px-3 py-3 font-bold text-indigo-700 text-center border-t-2 border-gray-400">
              ₵{{
                claim.user && claim.user.claim_total !== undefined
                  ? Number(claim.user.claim_total).toLocaleString()
                  : 'N/A'
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <!-- ...existing code for dialogs... -->
      <!-- No approve/reject buttons or dialogs on this view -->
    </div>
  </WidthConstraint>
  <!-- End of WidthConstraint wrapper -->
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-fadeIn {
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
