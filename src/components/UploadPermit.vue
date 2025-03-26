<script lang="ts" setup>
import { onMounted, ref, defineProps, watch } from "vue";
const props = defineProps({
  switch: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function as any,
    default: (e: any) => {}
  }
});
</script>
<template>
  <div></div>
</template>
<style lang="scss" scoped></style>
