<script lang="ts" setup>
defineProps<{ name: string; c?: boolean }>();
</script>
<template>
  <svg :class="`icon icon-${name} ${c ? 'c' : ''}`" aria-hidden="true">
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>
<style lang="scss" scoped>
.icon.c {
  cursor: pointer;
}
</style>
