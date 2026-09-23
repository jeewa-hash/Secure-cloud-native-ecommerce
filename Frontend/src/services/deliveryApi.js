import axios from "axios";
import config from "../config";
import { getAuthHeaders } from "../utils/auth";

const BASE_URL = config.DELIVERY_API;

export const getMyDeliveryProfile = async () => {
  return axios.get(`${BASE_URL}/delivery-profile`, {
    headers: getAuthHeaders(),
  });
};

export const createDeliveryProfile = async (data) => {
  return axios.post(`${BASE_URL}/delivery-persons`, data, {
    headers: getAuthHeaders(),
  });
};

export const updateMyDeliveryProfile = async (data) => {
  return axios.put(`${BASE_URL}/delivery-profile`, data, {
    headers: getAuthHeaders(),
  });
};

export const updateAvailabilityStatus = async (availabilityStatus) => {
  return axios.patch(
    `${BASE_URL}/delivery-profile/availability`,
    { availabilityStatus },
    {
      headers: getAuthHeaders(),
    }
  );
};

export const getMyShipments = async () => {
  return axios.get(`${BASE_URL}/shipments/my`, {
    headers: getAuthHeaders(),
  });
};

export const getShipmentById = async (shipmentId) => {
  return axios.get(`${BASE_URL}/shipments/${shipmentId}`, {
    headers: getAuthHeaders(),
  });
};

export const markShipmentPickedUp = async (shipmentId) => {
  return axios.patch(
    `${BASE_URL}/shipments/${shipmentId}/pickup`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

export const markShipmentInTransit = async (shipmentId, note = "") => {
  return axios.patch(
    `${BASE_URL}/shipments/${shipmentId}/in-transit`,
    { note },
    {
      headers: getAuthHeaders(),
    }
  );
};

export const markShipmentDelivered = async (shipmentId) => {
  return axios.patch(
    `${BASE_URL}/shipments/${shipmentId}/deliver`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};

export const markShipmentFailed = async (shipmentId, reason) => {
  return axios.patch(
    `${BASE_URL}/shipments/${shipmentId}/fail`,
    { reason },
    {
      headers: getAuthHeaders(),
    }
  );
};

export const markReturnInTransit = async (shipmentId, reason) => {
  return axios.patch(
    `${BASE_URL}/shipments/${shipmentId}/return`,
    { reason },
    {
      headers: getAuthHeaders(),
    }
  );
};

export const markReturnedToShop = async (shipmentId) => {
  return axios.patch(
    `${BASE_URL}/shipments/${shipmentId}/returned`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
};