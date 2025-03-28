import axios from "axios";
// import { userestStore } from "@/stores/rest";
const api = axios.create({
  baseURL: "https://strapi.phrynus.com"
});
export const setToken = (token: any) => {
  api.defaults.headers.common["Authorization"] = `bearer ${token}`;
};

export default api;
