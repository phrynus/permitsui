import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const watermarkTextStore = defineStore(
  "watermarkTextStore",
  () => {
    const text = ref("清欢");
    const mosaic = ref(true);

    return { text, mosaic };
  },
  {
    persist: true
  }
);
