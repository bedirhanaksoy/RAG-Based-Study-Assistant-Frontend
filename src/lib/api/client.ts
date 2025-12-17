import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://192.168.1.101:8000",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default apiClient;
