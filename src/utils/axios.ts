import axios from "axios";
// import { userestStore } from "@/stores/rest";
const api = axios.create({
  baseURL: "https://strapi.gommd.com"
});
export const setToken = (token: any) => {
  api.defaults.headers.common["Authorization"] = `bearer ${token}`;
};

export default api;
