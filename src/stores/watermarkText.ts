import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const watermarkTextStore = defineStore(
  "watermarkTextStore",
  () => {
    const text = ref("清欢");
    const watermark = ref(true);
    const mosaic = ref(true);

    return { text, mosaic, watermark };
  },
  {
    persist: true
  }
);
