import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义Silicon Flow模型选项
export const modelOptions = [
  { name: 'Qwen2.5-VL-7B', price: '￥0.35', value: 'Pro/Qwen/Qwen2.5-VL-7B-Instruct' },
  { name: 'Qwen2.5-VL-32B', price: '￥1.89', value: 'Qwen/Qwen2.5-VL-32B-Instruct' },
  { name: 'Qwen2.5-VL-72B', price: '￥4.13', value: 'Qwen/Qwen2.5-VL-72B-Instruct' },
];

export const useSiliconFlowStore = defineStore(
  'siliconflow',
  () => {
    // API密钥
    const apiKey = ref(import.meta.env.VITE_SILICONFLOW_API_KEY || '');

    // 当前选择的模型
    const currentModel = ref(modelOptions[2].value); // 默认使用32B模型

    // 设置API密钥
    function setApiKey(key: string) {
      apiKey.value = key;
    }

    // 设置当前模型
    function setModel(model: string) {
      currentModel.value = model;
    }

    return {
      apiKey,
      currentModel,
      setApiKey,
      setModel,
    };
  },
  {
    persist: true,
  }
);
