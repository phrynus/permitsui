<script lang="ts" setup>
defineProps<{ name: string }>();
</script>
<template>
  <svg :class="`icon icon-${name}`" aria-hidden="true">
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>
