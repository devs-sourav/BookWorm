import axios from "axios";

const api = axios.create({
  baseURL: "https://bookworm-t3mi.onrender.com/api/v1",
  // baseURL: "https://server.al-adal.com/api/v1/",
});

export default api;
