import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Store,
  User,
  RefreshCw,
} from "lucide-react";

import config from "../config";
const ORDER_SERVICE_URL = config.ORDER_API;

const ShopOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const statusOptions = [
    "pending",
    "accepted",
    "preparing",
    "ready",
    "picked-up",
    "delivered",
    "completed",
    "declined",
  ];

  const fetchShopOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const url =
        filter === "all"
          ? `${ORDER_SERVICE_URL}/shop/orders`
          : `${ORDER_SERVICE_URL}/shop/orders?status=${filter}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const fetchedOrders = res.data.orders || [];
        setOrders(fetchedOrders);

        const initialStatuses = {};
        fetchedOrders.forEach((order) => {
          initialStatuses[order._id] = order.status;
        });
        setSelectedStatuses(initialStatuses);
      } else {
        setError("Failed to load shop orders.");
      }
    } catch (err) {
      console.error("Error fetching shop orders:", err);
      setError(err?.response?.data?.message || "Failed to load shop orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopOrders();
  }, [filter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(orderId);
      setError("");

      const currentOrder = orders.find((order) => order._id === orderId);
      if (!currentOrder) {
        setError("Order not found in current view.");
        return;
      }

      if (currentOrder.status === newStatus) {
        setActionLoading("");
        return;
      }

      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${ORDER_SERVICE_URL}/shop/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.success) {
        setError(res.data.message || "Failed to update order status.");

        setSelectedStatuses((prev) => ({
          ...prev,
          [orderId]: currentOrder.status,
        }));
        return;
      }

      const updatedOrder = res.data.order;
      const deliveryAssignment = res.data.deliveryAssignment;

      // If backend allows success but delivery assignment failed for "ready",
      // do not update local UI state.
      if (newStatus === "ready" && !deliveryAssignment?.assigned) {
        setError(
          deliveryAssignment?.message ||
            "Delivery assignment failed. Order status was not updated."
        );

        setSelectedStatuses((prev) => ({
          ...prev,
          [orderId]: currentOrder.status,
        }));
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...updatedOrder,
                status: updatedOrder.status,
                timeline: updatedOrder.timeline || order.timeline,
                deliveryAssignmentStatus:
                  updatedOrder.deliveryAssignmentStatus ||
                  order.deliveryAssignmentStatus,
              }
            : order
        )
      );

      setSelectedStatuses((prev) => ({
        ...prev,
        [orderId]: updatedOrder.status,
      }));

      if (newStatus === "ready") {
        alert("Order marked as ready and delivery person assigned.");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(
        err?.response?.data?.message || "Failed to update order status."
      );

      const currentOrder = orders.find((order) => order._id === orderId);
      if (currentOrder) {
        setSelectedStatuses((prev) => ({
          ...prev,
          [orderId]: currentOrder.status,
        }));
      }
    } finally {
      setActionLoading("");
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const formatPrice = (price) => {
    return `LKR ${Number(price || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      accepted: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        label: "Accepted",
      },
      preparing: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Package,
        label: "Preparing",
      },
      ready: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: CheckCircle,
        label: "Ready",
      },
      "picked-up": {
        color: "bg-cyan-100 text-cyan-800 border-cyan-200",
        icon: Truck,
        label: "Picked Up",
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Delivered",
      },
      completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Completed",
      },
      declined: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Declined",
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      active: orders.filter((o) =>
        ["accepted", "preparing", "ready", "picked-up"].includes(o.status)
      ).length,
      completed: orders.filter((o) =>
        ["delivered", "completed"].includes(o.status)
      ).length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {orders.length > 0 && (
          <div className="mt-8 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.active}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Completed Orders</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
            <XCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-700 mr-2">Filter by:</span>

            {[
              "all",
              "pending",
              "accepted",
              "preparing",
              "ready",
              "delivered",
              "declined",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === item
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item === "all"
                  ? "All Orders"
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={fetchShopOrders}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition-all"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No orders found
            </h2>
            <p className="text-gray-500">
              There are no shop orders for the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleOrder(order._id)}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <Store className="text-orange-600" size={24} />
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Order #{order._id?.slice(-8)}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <Calendar size={14} className="text-gray-400 mr-1" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div
                          className={`px-3 py-1 rounded-full border ${statusInfo.color} flex items-center`}
                        >
                          <StatusIcon size={16} className="mr-1" />
                          <span className="text-sm font-medium">
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold text-orange-600">
                            {formatPrice(order.total)}
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="text-gray-400" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-bold mb-2 flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            Customer
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {order.user?.name || order.customerName || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold mb-2 flex items-center">
                            <Phone size={16} className="text-gray-400 mr-2" />
                            Contact
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {order.phone || order.user?.phone || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold mb-2 flex items-center">
                            <MapPin size={16} className="text-gray-400 mr-2" />
                            Address
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {order.address || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold mb-2 flex items-center">
                            <CreditCard size={16} className="text-gray-400 mr-2" />
                            Payment
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {order.paymentMethod || "Cash on Delivery"}
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold mb-4 flex items-center">
                          <Package className="text-orange-600 mr-2" size={20} />
                          Order Items
                        </h3>

                        <div className="space-y-3">
                          {(order.items || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="font-bold text-orange-600">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {order.instructions && (
                          <div className="mt-4">
                            <h4 className="font-bold mb-2 flex items-center">
                              <AlertCircle
                                size={16}
                                className="text-gray-400 mr-2"
                              />
                              Special Instructions
                            </h4>
                            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                              {order.instructions}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-gray-800 mb-1">
                              Update Order Status
                            </h3>
                            <p className="text-sm text-gray-500">
                              Current status:{" "}
                              <span className="font-semibold capitalize">
                                {order.status}
                              </span>
                            </p>
                            {order.deliveryAssignmentStatus && (
                              <p className="text-sm text-gray-500 mt-1">
                                Delivery Assignment:{" "}
                                <span className="font-semibold">
                                  {order.deliveryAssignmentStatus}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={selectedStatuses[order._id] || order.status}
                              onChange={(e) =>
                                setSelectedStatuses((prev) => ({
                                  ...prev,
                                  [order._id]: e.target.value,
                                }))
                              }
                              disabled={actionLoading === order._id}
                              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() =>
                                updateOrderStatus(
                                  order._id,
                                  selectedStatuses[order._id] || order.status
                                )
                              }
                              disabled={actionLoading === order._id}
                              className="px-4 py-2 rounded-xl text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {actionLoading === order._id
                                ? "Updating..."
                                : "Update"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="text-sm text-gray-500">Delivery Fee</p>
                            <p className="font-bold mt-2">Total</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {formatPrice(order.subtotal)}
                            </p>
                            <p className="text-sm">
                              {formatPrice(order.shippingFee)}
                            </p>
                            <p className="font-bold text-orange-600 mt-2">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOrdersPage;