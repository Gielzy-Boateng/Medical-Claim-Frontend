<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import WidthConstraint from '@/components/WidthConstraint.vue'
import { useClaimStore } from '@/stores/employee-claims'
import { storeToRefs } from 'pinia'

const formData = reactive({
  name: '',
  department: '',
  relation: 'myself',
  description: '', // will be set to expenditures array before submit
  amount: 0,
  document: null,
  expenditures: [{ medicine: '', price: 0 }],
})

function updateTotal() {
  formData.amount = formData.expenditures.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    return sum + price
  }, 0)
}

const { errors } = storeToRefs(useClaimStore())
const claimStore = useClaimStore()
const router = useRouter()

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function handleFileChange(event) {
  formData.document = event.target.files[0]
}

function addExpenditure() {
  formData.expenditures.push({ medicine: '', price: 0 })
  updateTotal()
}

function removeExpenditure(idx) {
  if (formData.expenditures.length > 1) {
    formData.expenditures.splice(idx, 1)
    updateTotal()
  }
}

async function handleSubmit() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  // Ensure expenditures are sent as description
  formData.description = formData.expenditures
  try {
    await claimStore.createClaim(formData)
    if (claimStore.errors && Object.keys(claimStore.errors).length === 0) {
      successMessage.value = 'Claim submitted successfully!'
      setTimeout(() => {
        router.push('/employee/dashboard')
      }, 1800)
    } else {
      errorMessage.value = claimStore.errors.general
        ? claimStore.errors.general[0]
        : 'Failed to submit claim.'
    }
  } catch {
    errorMessage.value = 'An error occurred.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <WidthConstraint>
    <div
      class="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
    >
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-8 text-indigo-600 text-center">Create Medical Claim</h1>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-y-8">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <label class="block mb-2 text-gray-700 font-semibold">Name of Beneficiary</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Enter beneficiary name"
                class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm bg-white"
              />
              <p v-if="errors.name" class="text-red-400">
                {{ errors.name[0] }}
              </p>
            </div>
            <div class="flex-1">
              <label class="block mb-2 text-gray-700 font-semibold">Department</label>
              <input
                v-model="formData.department"
                type="text"
                placeholder="Enter department"
                class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm bg-white"
              />
              <p v-if="errors.department" class="text-red-400">
                {{ errors.department[0] }}
              </p>
            </div>
          </div>
          <div>
            <label class="block mb-2 text-gray-700 font-semibold">Relation to Employee</label>
            <select
              v-model="formData.relation"
              class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm bg-white"
            >
              <option value="myself">Myself</option>
              <option value="child">Child</option>
              <option value="wife">Wife</option>
            </select>
            <p v-if="errors.relation" class="text-red-400">
              {{ errors.relation[0] }}
            </p>
          </div>
          <div class="w-full">
            <label class="block mb-2 text-gray-700 font-semibold">Expenditures</label>
            <div class="flex flex-col gap-3 mb-2">
              <div
                v-for="(item, idx) in formData.expenditures"
                :key="idx"
                class="flex items-center gap-3"
              >
                <input
                  v-model="item.medicine"
                  type="text"
                  placeholder="Medicine"
                  class="rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm bg-white flex-1"
                />
                <input
                  v-model="item.price"
                  type="number"
                  placeholder="Price"
                  class="rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm bg-white w-32"
                  @input="updateTotal"
                />
                <button
                  type="button"
                  @click="removeExpenditure(idx)"
                  class="text-white py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold shadow transition duration-200 flex items-center justify-center px-2"
                  v-if="formData.expenditures.length > 1"
                >
                  Remove
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="addExpenditure"
              class="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition duration-200 flex items-center justify-center gap-2 mt-2"
            >
              Add Expenditure
            </button>
            <p v-if="errors.description" class="text-red-400 mt-2">
              {{ errors.description.medicine[0] }}
            </p>
          </div>
          <div>
            <label class="block mb-2 text-gray-700 font-semibold">Total Amount</label>
            <input
              :value="formData.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Total amount"
              class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm bg-white"
              readonly
            />
            <p v-if="errors.amount" class="text-red-400">
              {{ errors.amount[0] }}
            </p>
          </div>
          <div>
            <label class="block mb-2 text-gray-700 font-semibold"
              >Add Medical Report
              <span class="text-xs text-gray-500">(PDF, JPG, PNG, DOCX)</span></label
            >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              @change="handleFileChange"
              class="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
            />
            <p v-if="errors.document" class="text-red-400">
              {{ errors.document[0] }}
            </p>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 mt-4 text-xl bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg
              v-if="loading"
              class="animate-spin h-6 w-6 text-white mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span>{{ loading ? 'Submitting...' : 'Submit Claim' }}</span>
          </button>
          <div v-if="successMessage" class="mt-4 text-green-600 text-center font-semibold">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="mt-4 text-red-500 text-center font-semibold">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </WidthConstraint>
</template>
