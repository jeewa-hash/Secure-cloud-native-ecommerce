// src/api.js
import axios from "axios";

// Set backend URL
export const API = axios.create({
  baseURL: "http://13.49.65.6:4000/api" // <-- ECS backend URL
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