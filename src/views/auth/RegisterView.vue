<script setup>
import WidthConstraint from '@/components/WidthConstraint.vue'
import { onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const formData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const { errors } = storeToRefs(useAuthStore())
const { authenticate } = useAuthStore()
const router = useRouter()
onMounted(() => {
  errors.value = {}
})
</script>

<template>
  <WidthConstraint>
    <div
      class="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-red-50 to-white rounded-xl shadow-lg p-8"
    >
      <h1 class="text-3xl font-bold mb-8 text-blue-600">Register</h1>
      <form
        class="flex flex-col gap-y-6 items-center justify-center w-full max-w-xl bg-white p-8 rounded-2xl shadow-md border border-gray-100"
        @submit.prevent="() => authenticate('register', formData, 'setRole', router)"
      >
        <div class="w-full flex flex-col items-center">
          <input
            placeholder="Name"
            type="text"
            class="w-4/5 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 shadow-sm bg-white text-lg"
            v-model="formData.name"
          />
          <p class="text-red-400 text-sm mt-1 w-4/5" v-if="errors.name">{{ errors.name[0] }}</p>
        </div>
        <div class="w-full flex flex-col items-center">
          <input
            placeholder="Email"
            type="email"
            class="w-4/5 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 shadow-sm bg-white text-lg"
            v-model="formData.email"
          />
          <p class="text-red-400 text-sm mt-1 w-4/5" v-if="errors.email">{{ errors.email[0] }}</p>
        </div>
        <div class="w-full flex flex-col items-center">
          <input
            placeholder="Password"
            type="password"
            class="w-4/5 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 shadow-sm bg-white text-lg"
            v-model="formData.password"
          />
          <p class="text-red-400 text-sm mt-1 w-4/5" v-if="errors.password">
            {{ errors.password[0] }}
          </p>
        </div>
        <div class="w-full flex flex-col items-center">
          <input
            placeholder="Comfirm Password"
            type="password"
            class="w-4/5 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 shadow-sm bg-white text-lg"
            v-model="formData.password_confirmation"
          />
          <p class="text-red-400 text-sm mt-1 w-4/5" v-if="errors.password_confirmation">
            {{ errors.password_confirmation[0] }}
          </p>
        </div>
        <button
          class="w-4/5 py-3 mt-4 text-2xl bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow transition duration-200"
        >
          Register
        </button>
      </form>
    </div>
  </WidthConstraint>
</template>
