import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const userestStore = defineStore(
  "userestStore",
  () => {
    const explore = ref("");
    const search = ref("");
    const areas = ref("");
    const tags = ref("");
    const token = ref("");
    return { explore, search, areas, tags, token };
  },
  {
    persist: true
  }
);
