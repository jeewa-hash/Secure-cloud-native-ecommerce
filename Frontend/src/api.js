// src/api.js
import axios from "axios";

const localApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const API = axios.create({
  baseURL: localApiBaseUrl
});

// Example function
export const getOrders = async () => {
  const res = await API.get("/order/history"); // matches backend route
  return res.data;
};

export const checkoutOrder = async (orderData) => {
  const res = await API.post("/order/checkout", orderData);
  return res.data;
};