import axios from "axios";

const api = axios.create({
  // URL de tu API en Render
  baseURL: "https://sistema-facturacion-api-xkh7.onrender.com",
});

export default api;