<script setup>
import { computed } from 'vue'
import { CheckCircle, XCircle, Clock } from 'lucide-vue-next' // ✅ Make sure you're using lucide-vue-next or similar

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
    <h2 class="text-2xl font-bold text-center text-indigo-700 tracking-wide animate-fadeInUp">
      Claim Approval Timeline
    </h2>
    <div class="flex flex-col gap-y-10 relative border-l-4 border-indigo-200 ml-4 pl-8">
      <transition-group name="timeline-fade" tag="div">
        <div
          v-for="(step, index) in flow"
          :key="index"
          class="relative flex items-start gap-4 group animate-fadeInUp"
        >
          <div class="absolute -left-[38px] top-1 flex flex-col items-center">
            <div
              class="bg-white rounded-full shadow-lg p-1 border-2 border-indigo-100 group-hover:scale-110 group-hover:border-indigo-400 transition-transform duration-300"
            >
              <component
                :is="
                  step.action === 'approved'
                    ? CheckCircle
                    : step.action === 'rejected'
                      ? XCircle
                      : Clock
                "
                :class="[
                  'w-7 h-7',
                  step.action === 'approved' ? 'text-green-600' : '',
                  step.action === 'rejected' ? 'text-red-600' : '',
                  step.action === 'pending' ? 'text-yellow-500 animate-pulse' : '',
                  step.action === 'skipped' ? 'text-gray-400' : '',
                ]"
              />
            </div>
            <div
              v-if="index < flow.length - 1"
              class="h-8 w-1 bg-gradient-to-b from-indigo-200 to-indigo-100 mt-1"
            ></div>
          </div>
          <div
            class="space-y-2 bg-white rounded-xl px-7 py-4 shadow-lg border border-indigo-100 min-w-[200px] max-w-[340px] transition-all duration-300 group-hover:shadow-2xl group-hover:border-indigo-300 animate-fadeInUp"
          >
            <h3 class="font-semibold text-lg capitalize flex items-center gap-2">
              <span>{{ step.stage }}</span>
              <span v-if="step.by_name" class="text-sm text-gray-500 font-normal"
                >— {{ step.by_name }}</span
              >
            </h3>
            <p
              v-if="step.action === 'approved'"
              class="text-green-700 text-sm font-medium animate-fadeInUp"
            >
              <span class="inline-block align-middle">✔️</span> Approved on
              {{ new Date(step.at).toLocaleString() }}
            </p>
            <p
              v-else-if="step.action === 'rejected'"
              class="text-red-700 text-sm font-medium animate-fadeInUp"
            >
              <span class="inline-block align-middle">❌</span> Rejected on
              {{ new Date(step.at).toLocaleString() }}<br />
              <span class="font-normal">Reason:</span> {{ step.reason }}
            </p>
            <p
              v-else-if="step.action === 'pending'"
              class="text-yellow-600 text-sm font-medium animate-fadeInUp"
            >
              <span class="inline-block align-middle">⏳</span> Currently under review
            </p>
            <p v-else-if="step.action === 'skipped'" class="text-gray-400 text-sm animate-fadeInUp">
              Not yet reached
            </p>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s infinite;
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
.animate-fadeInUp {
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
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
.timeline-fade-enter-active,
.timeline-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.timeline-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.timeline-fade-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
</style>
