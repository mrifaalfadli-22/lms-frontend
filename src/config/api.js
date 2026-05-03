import axios from "axios";

const api = axios.create({
  // Jika json-server jalan di port 5000
  baseURL: "http://localhost:5000",
  timeout: 5000,
});

export default api;
