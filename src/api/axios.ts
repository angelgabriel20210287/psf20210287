import axios from "axios";

const api = axios.create({
  baseURL: "https://sistema-facturacion-api-xkh7.onrender.com",
});

export default api;
