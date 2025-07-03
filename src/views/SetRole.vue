<template>
  <WidthConstraint>
    <div
      class="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-lg p-10"
    >
      <div class="w-full max-w-xl bg-white rounded-2xl shadow p-8 flex flex-col items-center">
        <h1 v-if="authStore.user" class="text-3xl font-bold mb-2 text-indigo-700">
          Welcome, {{ authStore.user.name }}
        </h1>
        <h2 class="text-xl md:text-2xl font-bold mb-8 text-gray-700">Select Your Role</h2>
        <div class="flex flex-wrap gap-6 justify-center mb-6">
          <button
            v-for="role in roles"
            :key="role.value"
            @click="state.selected = role.value"
            :class="[
              'px-8 py-4 rounded-xl text-lg font-semibold shadow-md border-2 transition-all duration-200',
              state.selected === role.value
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-500 scale-105 drop-shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50',
            ]"
          >
            {{ role.label }}
          </button>
        </div>
        <div v-if="state.selected" class="mt-4 text-lg text-gray-700">
          <span class="font-semibold">Selected:</span>
          <span class="font-bold text-indigo-600">{{
            roles.find((r) => r.value === state.selected).label
          }}</span>
        </div>
        <button
          class="mt-10 w-full md:w-2/3 py-3 text-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-bold shadow transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!state.selected || state.loading"
          v-on:click="setRoleAndNavigate"
        >
          <span v-if="!state.loading">Submit</span>
          <span v-else>Submitting...</span>
        </button>
        <p v-if="state.error" class="mt-4 text-red-500 text-center">
          {{ state.error }}
        </p>
      </div>
    </div>
  </WidthConstraint>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import WidthConstraint from '@/components/WidthConstraint.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()

onMounted(() => authStore.getAuthUser())

const roles = [
  { label: 'Employee', value: 'employee' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'General Manager', value: 'manager' },
  { label: 'HR', value: 'hr' },
  { label: 'Account', value: 'account' },
]

const state = reactive({
  selected: null,
})

const router = useRouter()

async function setRoleAndNavigate() {
  if (!state.selected) return

  state.loading = true
  state.error = null

  try {
    const res = await fetch('/api/set-role', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json', // <-- add this line
      },
      body: JSON.stringify({ role: state.selected }),
    })

    const data = await res.json()

    if (data.user) {
      authStore.user = data.user // update user in store

      // Navigate based on role
      router.push(`/${data.user.role}/dashboard`)
    } else {
      state.error = 'Something went wrong. Please try again.'
    }
  } catch (err) {
    console.error(err)
    state.error = 'Network error. Please try again.'
  } finally {
    state.loading = false
  }
}
</script>
