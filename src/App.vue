<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import WidthConstraint from './components/WidthConstraint.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const { user } = storeToRefs(useAuthStore())
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
</script>

<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-xl py-1.5 backdrop-blur-md bg-opacity-90"
  >
    <WidthConstraint>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span
            v-if="user"
            class="flex items-center gap-2 text-white text-2xl font-extrabold tracking-wide cursor-default select-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            MedClaim
          </span>
          <RouterLink
            v-else
            to="/"
            class="flex items-center gap-2 text-white text-2xl font-extrabold tracking-wide hover:text-cyan-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            MedClaim
          </RouterLink>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <template v-if="!user">
            <RouterLink
              v-if="route.name === 'home'"
              to="/register"
              class="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-50 transition border border-indigo-100"
              >Register</RouterLink
            >
            <RouterLink
              v-if="route.name === 'home'"
              to="/login"
              class="text-white px-4 py-2 rounded-lg hover:bg-cyan-600/80 transition font-medium"
              >Login</RouterLink
            >
          </template>
          <template v-else>
            <span class="text-white text-lg font-semibold flex flex-col items-end">
              Welcome, {{ user.name }}
              <span class="text-indigo-100 text-sm font-normal capitalize"
                >( {{ user.role }} at Estate Masters )</span
              >
            </span>
            <button
              @click="authStore.logout(router)"
              class="ml-4 px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold shadow hover:bg-indigo-50 transition border border-indigo-100"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </WidthConstraint>
  </nav>
  <div class="pt-24">
    <RouterView />
  </div>
</template>
