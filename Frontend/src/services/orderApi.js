import axios from "axios";
import config from "../config";
import { getAuthHeaders } from "../utils/auth";

const BASE_URL = config.ORDER_API;

export const updateShopOrderStatus = async (orderId, status) => {
  return axios.patch(
    `${BASE_URL}/shop/orders/${orderId}/status`,
    { status },
    {
      headers: getAuthHeaders(),
    }
  );
};