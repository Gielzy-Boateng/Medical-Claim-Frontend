<template>
  <WidthConstraint>
    <div
      class="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-lg p-10"
    >
      <div class="w-full max-w-xl bg-white rounded-2xl shadow p-8 flex flex-col items-center">
        <h1 v-if="authStore.user" class="text-3xl font-bold mb-2 text-indigo-700">
          Welcome, {{ authStore.user.name }}
        </h1>
        <h2 class="text-xl md:text-2xl font-bold mb-8 text-gray-700">Role Assignment</h2>

        <!-- Role Information -->
        <div class="w-full mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">Role Assignment Policy</h3>
          <p class="text-blue-700 text-sm leading-relaxed">
            New users are automatically assigned the <strong>Employee</strong> role. Higher-level
            roles (Supervisor, Manager, HR, Account) can only be assigned by HR administrators.
          </p>
        </div>

        <!-- Current Role Display -->
        <div class="w-full mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <h3 class="text-lg font-semibold text-green-800 mb-2">Your Current Role</h3>
          <p class="text-green-700">
            <span class="font-bold">{{ getRoleLabel(authStore.user?.role || 'employee') }}</span>
          </p>
        </div>

        <!-- Contact HR Section -->
        <div class="w-full mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h3 class="text-lg font-semibold text-amber-800 mb-2">Need Role Change?</h3>
          <p class="text-amber-700 text-sm leading-relaxed">
            If you need a different role assigned, please contact your HR department. Role changes
            require administrative approval.
          </p>
        </div>

        <button
          class="w-full md:w-2/3 py-3 text-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold shadow transition duration-200"
          @click="proceedToDashboard"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  </WidthConstraint>
</template>

<script setup>
import { onMounted } from 'vue'
import WidthConstraint from '@/components/WidthConstraint.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => authStore.getAuthUser())

const getRoleLabel = (role) => {
  const roleLabels = {
    employee: 'Employee',
    supervisor: 'Supervisor',
    manager: 'General Manager',
    hr: 'HR',
    account: 'Account',
  }
  return roleLabels[role] || 'Employee'
}

const proceedToDashboard = () => {
  const role = authStore.user?.role || 'employee'
  router.push(`/${role}/dashboard`)
}
</script>
