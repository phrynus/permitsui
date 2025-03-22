<script setup lang="ts">
import { RouterView } from "vue-router";
import { userestStore } from "@/stores/rest";
import { setToken } from "@/utils/axios";
const store: any = userestStore();
setToken(store.token);
</script>

<template>
  <RouterView />
  <Trajectory />
</template>

<style scoped lang="scss"></style>
