<script setup>
import { computed } from 'vue'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  claim: {
    type: Object,
    required: true,
  },
})

const stages = ['supervisor', 'manager', 'hr', 'account']

const flow = computed(() => {
  let history = props.claim.flow_history

  // ✅ Ensure flow_history is parsed JSON
  if (typeof history === 'string') {
    try {
      history = JSON.parse(history)
    } catch (e) {
      console.error('Failed to parse flow_history:', e)
      history = []
    }
  } else if (!Array.isArray(history)) {
    history = []
  }

  const result = []

  for (const stage of stages) {
    const entry = history.find((h) => h.stage === stage)

    if (entry) {
      result.push({ stage, ...entry })
    } else if (props.claim.status === 'pending' && props.claim.stage === stage) {
      result.push({ stage, action: 'pending' })
    } else if (props.claim.status === 'approved' || props.claim.status === 'rejected') {
      result.push({ stage, action: 'skipped' })
    }
  }

  return result
})
</script>

<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Claim Approval Timeline</h2>
      <div
        class="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"
      ></div>
    </div>

    <div class="relative">
      <!-- Timeline Line -->
      <div
        class="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 rounded-full"
      ></div>

      <div class="space-y-16">
        <transition-group name="timeline-fade" tag="div">
          <div
            v-for="(step, index) in flow"
            :key="`${step.stage}-${step.action}`"
            class="relative flex items-start gap-6 group mb-8"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- Timeline Node -->
            <div class="relative flex-shrink-0">
              <!-- Pulsing Background for Pending/Rejected -->
              <div
                v-if="step.action === 'pending' || step.action === 'rejected'"
                class="absolute inset-0 w-12 h-12 rounded-full animate-ping"
                :class="[step.action === 'pending' ? 'bg-yellow-400' : 'bg-red-400']"
                style="animation-duration: 2s"
              ></div>

              <!-- Main Node -->
              <div
                class="relative w-12 h-12 rounded-full shadow-lg border-4 border-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                :class="[
                  step.action === 'approved' ? 'bg-gradient-to-br from-green-400 to-green-600' : '',
                  step.action === 'rejected' ? 'bg-gradient-to-br from-red-400 to-red-600' : '',
                  step.action === 'pending'
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : '',
                  step.action === 'skipped' ? 'bg-gradient-to-br from-gray-300 to-gray-400' : '',
                ]"
              >
                <component
                  :is="
                    step.action === 'approved'
                      ? CheckCircle
                      : step.action === 'rejected'
                        ? XCircle
                        : step.action === 'pending'
                          ? AlertCircle
                          : Clock
                  "
                  :class="['w-6 h-6 text-white drop-shadow-sm']"
                />
              </div>

              <!-- Connection Line -->
              <div
                v-if="index < flow.length - 1"
                class="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-indigo-200 to-purple-200"
              ></div>
            </div>

            <!-- Content Card -->
            <div
              class="flex-1 bg-white rounded-2xl px-6 py-5 shadow-lg border border-gray-100 transition-all duration-300 group-hover:shadow-2xl group-hover:border-indigo-200 group-hover:transform group-hover:-translate-y-1"
              :class="[
                step.action === 'approved' ? 'group-hover:border-green-200' : '',
                step.action === 'rejected' ? 'group-hover:border-red-200' : '',
                step.action === 'pending' ? 'group-hover:border-yellow-200' : '',
              ]"
            >
              <!-- Header -->
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-lg capitalize text-gray-800 flex items-center gap-2">
                  <span
                    class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    {{ step.stage }}
                  </span>
                  <span v-if="step.by_name" class="text-sm text-gray-500 font-medium">
                    — {{ step.by_name }}
                  </span>
                </h3>

                <!-- Status Badge -->
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="[
                    step.action === 'approved' ? 'bg-green-100 text-green-700' : '',
                    step.action === 'rejected' ? 'bg-red-100 text-red-700' : '',
                    step.action === 'pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : '',
                    step.action === 'skipped' ? 'bg-gray-100 text-gray-500' : '',
                  ]"
                >
                  {{ step.action.charAt(0).toUpperCase() + step.action.slice(1) }}
                </span>
              </div>

              <!-- Status Message -->
              <div class="space-y-2">
                <p
                  v-if="step.action === 'approved'"
                  class="text-green-700 text-sm font-medium flex items-center gap-2"
                >
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  Approved on {{ new Date(step.at).toLocaleString() }}
                </p>

                <div
                  v-else-if="step.action === 'rejected'"
                  class="text-red-700 text-sm font-medium"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <XCircle class="w-4 h-4 text-red-600" />
                    Rejected on {{ new Date(step.at).toLocaleString() }}
                  </div>
                  <div class="bg-red-50 border-l-4 border-red-400 pl-3 py-2 rounded-r-lg">
                    <span class="font-medium text-red-800">Reason:</span>
                    <span class="text-red-700 ml-1">{{ step.reason }}</span>
                  </div>
                </div>

                <p
                  v-else-if="step.action === 'pending'"
                  class="text-yellow-700 text-sm font-medium flex items-center gap-2"
                >
                  <AlertCircle class="w-4 h-4 text-yellow-600 animate-pulse" />
                  Currently under review
                </p>

                <p
                  v-else-if="step.action === 'skipped'"
                  class="text-gray-500 text-sm flex items-center gap-2"
                >
                  <Clock class="w-4 h-4 text-gray-400" />
                  Not yet reached
                </p>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.timeline-fade-enter-active,
.timeline-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.timeline-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.timeline-fade-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* Staggered animation for timeline items */
.group {
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
