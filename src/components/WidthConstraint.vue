<script setup>
import { cn } from '../../utils/cn'

const props = defineProps({
  className: String,
})
</script>

<template>
  <div :class="cn('max-w-[1200px] mx-auto p-5', props.className)">
    <slot></slot>
  </div>
</template>
