<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { userestStore } from '@/stores/rest';
const router = useRouter();
const route = useRoute();
const store: any = userestStore();

try {
  if (route.params.token) {
    store.token = route.params.token;
    router.push({ path: '/' });
  }
} catch (error) {
  console.log(error);
}

onMounted(async () => {});
</script>
<template>
  <div></div>
</template>
<style lang="scss" scoped></style>
