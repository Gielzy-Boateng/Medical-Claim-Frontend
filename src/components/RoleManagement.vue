<template>
  <div class="w-full max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Role Management</h2>

      <!-- User Search -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Users List -->
      <div class="space-y-4">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-800">{{ user.name }}</h3>
              <p class="text-sm text-gray-600">{{ user.email }}</p>
              <span
                class="inline-block px-2 py-1 text-xs font-medium rounded-full"
                :class="getRoleBadgeClass(user.role)"
              >
                {{ getRoleLabel(user.role) }}
              </span>
            </div>

            <div class="flex items-center space-x-3">
              <select
                v-model="userRoleChanges[user.id]"
                class="p-2 border border-gray-300 rounded-md text-sm"
                :disabled="user.role === 'hr' && user.id !== authStore.user?.id"
              >
                <option value="">Select Role</option>
                <option value="employee">Employee</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="account">Account</option>
              </select>

              <button
                @click="assignRole(user.id, userRoleChanges[user.id])"
                :disabled="!userRoleChanges[user.id] || userRoleChanges[user.id] === user.role"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-green-700">{{ successMessage }}</p>
      </div>

      <!-- Role Assignment Guidelines -->
      <div class="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
        <h3 class="text-lg font-semibold text-amber-800 mb-4">Role Assignment Guidelines</h3>
        <div class="space-y-3 text-sm text-amber-700">
          <div><strong>Employee:</strong> Default role for all new registrations</div>
          <div><strong>Supervisor:</strong> Can approve/reject claims from employees</div>
          <div><strong>Manager:</strong> Can approve/reject claims from supervisors</div>
          <div><strong>HR:</strong> Can approve/reject claims from managers and manage roles</div>
          <div><strong>Account:</strong> Final approval for claims and payment processing</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const searchQuery = ref('')
const userRoleChanges = ref({})

const getRoleLabel = (role) => {
  const roleLabels = {
    employee: 'Employee',
    supervisor: 'Supervisor',
    manager: 'Manager',
    hr: 'HR',
    account: 'Account',
  }
  return roleLabels[role] || 'Employee'
}

const getRoleBadgeClass = (role) => {
  const classes = {
    employee: 'bg-gray-100 text-gray-800',
    supervisor: 'bg-blue-100 text-blue-800',
    manager: 'bg-purple-100 text-purple-800',
    hr: 'bg-red-100 text-red-800',
    account: 'bg-green-100 text-green-800',
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  return users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    const data = await res.json()

    if (res.ok) {
      users.value = data.data || []
    } else {
      error.value = data.message || 'Failed to fetch users'
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Network error occurred'
  } finally {
    loading.value = false
  }
}

const assignRole = async (userId, newRole) => {
  if (!newRole) return

  try {
    const updatedUser = await authStore.assignRoleToUser(userId, newRole)

    if (updatedUser) {
      // Update the user in the local list
      const userIndex = users.value.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = updatedUser
      }

      // Clear the role change for this user
      userRoleChanges.value[userId] = ''

      // Show success message
      successMessage.value = `Role ${newRole} assigned successfully to ${updatedUser.name}`
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('Failed to assign role:', err)
    error.value = 'Failed to assign role. Please try again.'
    setTimeout(() => {
      error.value = ''
    }, 3000)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
