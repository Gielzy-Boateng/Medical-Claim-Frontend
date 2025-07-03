<script setup>
import WidthConstraint from '@/components/WidthConstraint.vue'
import logo from '@/assets/logo-2.jpg'
</script>

<template>
  <WidthConstraint>
    <section
      class="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-cyan-100 via-blue-200 to-indigo-200 rounded-3xl shadow-xl p-8"
    >
      <div class="text-center max-w-2xl">
        <h1 class="text-5xl md:text-6xl font-extrabold text-indigo-600 mb-6 drop-shadow-lg">
          Welcome to MedClaim Portal
        </h1>
        <p class="text-xl md:text-2xl text-gray-700 mb-8">
          Effortlessly manage your medical claims with role-based dashboards for Employees,
          Procurement, HR, and Accounts. Secure, fast, and user-friendly.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/register"
            class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white text-lg font-bold rounded-2xl shadow transition duration-200"
          >
            Get Started
          </router-link>
          <router-link
            to="/login"
            class="px-8 py-4 bg-white border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50 text-lg font-bold rounded-2xl shadow transition duration-200"
          >
            Login
          </router-link>
        </div>
      </div>
      <!-- Add your hero image below. Replace the src with your own image if desired. -->
      <img
        :src="logo"
        alt="Medical Claim Illustration"
        class="mt-10 w-full max-w-md rounded-xl shadow-lg hidden md:block"
      />
    </section>
  </WidthConstraint>
</template>
