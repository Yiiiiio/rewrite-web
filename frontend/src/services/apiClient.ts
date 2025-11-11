import axios from "axios";

// 支持环境变量配置后端 API 地址
// 开发环境使用 /api（通过 Vite proxy），生产环境使用完整 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000 * 30
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(error);
  }
);

