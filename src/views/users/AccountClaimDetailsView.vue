<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClaimStore } from '@/stores/employee-claims'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import WidthConstraint from '@/components/WidthConstraint.vue'

const route = useRoute()
const claim = ref(null)
const loading = ref(true)
const error = ref(null)
const { errors } = storeToRefs(useClaimStore())

const showRejectDialog = ref(false)
const rejectReason = ref('')

const claimStore = useClaimStore()
const router = useRouter()
const showSuccessDialog = ref(false)
const successMessage = ref('')

const authStore = useAuthStore()

onMounted(async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/post/${route.params.id}`, {
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

async function handleApprove() {
  if (!claim.value?.id) return
  const data = await claimStore.approveClaim(claim.value.id)
  if (data && data.data) {
    claim.value = data.data // update claim with fresh data from backend
  }
  await new Promise((r) => setTimeout(r, 50))
  if (!claimStore.errors || !Object.keys(claimStore.errors).length) {
    successMessage.value = 'Claim approved successfully.'
    showSuccessDialog.value = true
    setTimeout(() => {
      showSuccessDialog.value = false
      router.push('/account/dashboard')
    }, 1200)
  }
}

async function submitReject() {
  if (!claim.value?.id) return
  await claimStore.rejectClaim(claim.value.id, { reason: rejectReason.value })
  await new Promise((r) => setTimeout(r, 50))
  if (!claimStore.errors || !Object.keys(claimStore.errors).length) {
    showRejectDialog.value = false
    rejectReason.value = ''
    successMessage.value = 'Claim rejected successfully.'
    showSuccessDialog.value = true
    setTimeout(() => {
      showSuccessDialog.value = false
      router.push('/account/dashboard')
    }, 1200)
  }
}

const goToPrintView = () => {
  if (claim.value?.id) {
    router.push(`/account/claims/${claim.value.id}/print`)
  }
}

function getMyAction() {
  if (!claim.value || !claim.value.flow_history || !authStore.user) return null
  let history =
    typeof claim.value.flow_history === 'string'
      ? JSON.parse(claim.value.flow_history)
      : claim.value.flow_history
  return history.find((h) => h.by === authStore.user.id)
}
</script>

<template>
  <WidthConstraint class="mt-10">
    <button
      class="z-20 flex items-center gap-2 px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full shadow border border-gray-300 text-base font-semibold transition"
      @click="router.back()"
      title="Go Back"
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button></WidthConstraint
  >
  <div
    class="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 relative"
  >
    <!-- Approve/Reject Buttons or Status and Print Button -->
    <div class="absolute right-8 top-8 z-10 flex flex-row items-center gap-3" v-if="!getMyAction()">
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors duration-150 flex items-center gap-2"
        style="min-width: 110px"
        title="Print Claim Details"
        @click="goToPrintView"
      >
        🖨️ Print
      </button>
      <template v-if="claim && claim.status === 'rejected'">
        <span
          class="px-6 py-2 rounded-full border border-red-300 bg-red-100 text-red-700 font-semibold shadow text-lg select-none block"
        >
          Rejected
        </span>
      </template>
      <template v-else-if="claim && claim.status === 'approved'">
        <span
          class="px-6 py-2 rounded-full border border-green-300 bg-green-100 text-green-700 font-semibold shadow text-lg select-none block"
        >
          Approved
        </span>
      </template>
      <template v-else>
        <button
          class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-6 py-2 rounded-lg border border-red-300 shadow transition-colors duration-150"
          style="min-width: 110px"
          title="Reject Claim"
          @click="showRejectDialog = true"
        >
          Reject
        </button>
        <button
          class="bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-6 py-2 rounded-lg border border-green-300 shadow transition-colors duration-150"
          style="min-width: 110px"
          title="Approve Claim"
          @click="handleApprove"
        >
          Approve
        </button>
      </template>
    </div>
    <div v-if="loading" class="text-center py-10 text-lg text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>
    <div v-else>
      <div class="flex items-start justify-start mb-8">
        <h2 class="text-start text-3xl font-bold text-indigo-700 w-full">
          Claim by {{ claim.user?.name || 'Unknown User' }}
        </h2>
      </div>
      <div v-if="claim.document_url" class="flex flex-col items-center mb-10">
        <a :href="claim.document_url" target="_blank" class="block w-full">
          <img
            :src="claim.document_url"
            alt="Claim Document"
            class="w-full max-h-[600px] object-contain rounded-2xl border border-gray-200 bg-gray-50 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
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
              class="border-b-2 border-gray-400"
            >
              <td
                class="px-3 py-3 border-2 border-gray-400 text-lg text-center"
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
                class="px-3 py-3 border-2 border-gray-400 text-lg text-center"
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
                class="px-3 py-3 border-2 border-gray-400 text-lg text-center"
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
                class="px-3 py-3 border-2 border-gray-400 text-lg text-center"
                v-if="i === 0"
                :rowspan="
                  Array.isArray(claim.description)
                    ? claim.description.length
                    : parseDescription(claim.description).length
                "
              >
                {{ claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A' }}
              </td>
              <td class="px-3 py-3 border-2 border-gray-400 text-center">{{ item.medicine }}</td>
              <td class="px-3 py-3 border-2 border-gray-400 text-center">{{ item.price }}</td>
            </tr>
            <tr class="border-t-2 border-green-200">
              <td colspan="4" class="border-t-2 border-gray-400"></td>
              <td class="px-3 py-3 font-bold bg-green-50 text-center border-t-2 border-gray-400">
                Total
              </td>
              <td
                class="px-3 py-3 font-bold text-green-700 bg-green-50 text-center border-t-2 border-gray-400"
              >
                ₵{{ claim.amount }}
              </td>
            </tr>
          </template>
          <tr v-else class="border-b-2 border-gray-400">
            <td class="px-3 py-3 border-2 border-gray-400 text-lg text-center">
              {{ claim.name || claim.beneficiary_name || claim.user?.name || 'N/A' }}
            </td>
            <td class="px-3 py-3 border-2 border-gray-400 text-lg text-center">
              {{ claim.department || claim.user?.department || 'N/A' }}
            </td>
            <td class="px-3 py-3 border-2 border-gray-400 text-lg text-center">
              {{ claim.relation || 'N/A' }}
            </td>
            <td class="px-3 py-3 border-2 border-gray-400 text-lg text-center">
              {{ claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A' }}
            </td>
            <td class="px-3 py-3 border-2 border-gray-400 text-gray-400 text-center" colspan="2">
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
      <!-- Success Dialog -->
      <transition name="fade">
        <div
          v-if="showSuccessDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs text-center animate-fadeIn"
          >
            <p class="text-green-700 text-lg font-semibold">{{ successMessage }}</p>
          </div>
        </div>
      </transition>
      <!-- Reject Reason Dialog -->
      <transition name="fade">
        <div
          v-if="showRejectDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <h3 class="text-xl font-bold mb-4 text-center text-red-700">Reject Claim</h3>
            <label class="block mb-2 text-gray-700 font-medium" for="reject-reason">Reason</label>
            <textarea
              id="reject-reason"
              v-model="rejectReason"
              class="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
              rows="4"
              placeholder="Please add your reason"
            ></textarea>
            <div class="flex justify-end gap-3">
              <button
                class="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                @click="showRejectDialog = false"
              >
                Cancel
              </button>
              <button
                class="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                @click="submitReject"
                :disabled="!rejectReason.trim()"
              >
                Submit
              </button>
            </div>
            <p v-if="errors && Object.keys(errors).length" class="text-red-500 mt-2 text-sm">
              <span v-for="(msgs, key) in errors" :key="key">
                <span v-for="msg in Array.isArray(msgs) ? msgs : [msgs]" :key="msg">
                  {{ msg }}<br />
                </span>
              </span>
            </p>
          </div>
        </div>
      </transition>
      <div v-if="getMyAction()" class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 class="font-semibold text-blue-800 mb-2">My Action on This Claim</h4>
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          :class="
            getMyAction().action === 'approved'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : getMyAction().action === 'rejected'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          "
        >
          {{
            getMyAction().action === 'approved'
              ? '✅ Approved'
              : getMyAction().action === 'rejected'
                ? '❌ Rejected'
                : '⏳ Pending'
          }}
        </span>
        <span class="text-sm text-gray-600"
          >on {{ new Date(getMyAction().at).toLocaleString() }}</span
        >
        <span v-if="getMyAction().reason" class="text-sm text-gray-600"
          >- {{ getMyAction().reason }}</span
        >
      </div>
    </div>
  </div>
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
