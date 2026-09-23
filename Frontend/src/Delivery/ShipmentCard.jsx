import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Truck,
} from "lucide-react";
import {
  markShipmentDelivered,
  markShipmentFailed,
  markShipmentInTransit,
  markShipmentPickedUp,
  markReturnInTransit,
  markReturnedToShop,
} from "../services/deliveryApi";

const ShipmentCard = ({ shipment, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState("");

  const handleAction = async (type) => {
    try {
      setActionLoading(type);

      if (type === "pickup") {
        await markShipmentPickedUp(shipment._id);
      } else if (type === "transit") {
        await markShipmentInTransit(shipment._id);
      } else if (type === "deliver") {
        await markShipmentDelivered(shipment._id);
      } else if (type === "fail") {
        const reason = window.prompt("Enter failure reason:");
        if (!reason) return;
        await markShipmentFailed(shipment._id, reason);
      } else if (type === "return") {
        const reason = window.prompt("Enter return reason:");
        if (!reason) return;
        await markReturnInTransit(shipment._id, reason);
      } else if (type === "returned") {
        await markReturnedToShop(shipment._id);
      }

      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update shipment.");
    } finally {
      setActionLoading("");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
      PICKED_UP: "bg-cyan-100 text-cyan-700 border-cyan-200",
      IN_TRANSIT: "bg-purple-100 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-100 text-green-700 border-green-200",
      FAILED: "bg-red-100 text-red-700 border-red-200",
      RETURN_IN_TRANSIT: "bg-amber-100 text-amber-700 border-amber-200",
      RETURNED_TO_SHOP: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2.5 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                Shipment
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                #{shipment._id?.slice(-8)}
              </h3>
            </div>
          </div>

          <div className={`inline-flex px-3 py-1 rounded-full border text-sm font-semibold ${getStatusBadge(shipment.status)}`}>
            {shipment.status.replaceAll("_", " ")}
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
              <span>{shipment.address || "No address available"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{shipment.phone || "No phone available"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <span>Zip Code: {shipment.zipCode || "-"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {shipment.status === "ASSIGNED" && (
            <button
              onClick={() => handleAction("pickup")}
              disabled={actionLoading === "pickup"}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-60"
            >
              {actionLoading === "pickup" ? "Updating..." : "Mark Picked Up"}
            </button>
          )}

          {shipment.status === "PICKED_UP" && (
            <button
              onClick={() => handleAction("transit")}
              disabled={actionLoading === "transit"}
              className="px-4 py-2 rounded-xl bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {actionLoading === "transit" ? "Updating..." : "Mark In Transit"}
            </button>
          )}

          {shipment.status === "IN_TRANSIT" && (
            <>
              <button
                onClick={() => handleAction("deliver")}
                disabled={actionLoading === "deliver"}
                className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60"
              >
                {actionLoading === "deliver" ? "Updating..." : "Mark Delivered"}
              </button>

              <button
                onClick={() => handleAction("fail")}
                disabled={actionLoading === "fail"}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading === "fail" ? "Updating..." : "Mark Failed"}
              </button>
            </>
          )}

          {shipment.status === "FAILED" && (
            <button
              onClick={() => handleAction("return")}
              disabled={actionLoading === "return"}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
            >
              {actionLoading === "return" ? "Updating..." : "Return To Shop"}
            </button>
          )}

          {shipment.status === "RETURN_IN_TRANSIT" && (
            <button
              onClick={() => handleAction("returned")}
              disabled={actionLoading === "returned"}
              className="px-4 py-2 rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {actionLoading === "returned" ? "Updating..." : "Returned To Shop"}
            </button>
          )}
        </div>
      </div>

      {shipment.trackingSteps?.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Tracking Timeline</h4>
          <div className="space-y-3">
            {shipment.trackingSteps.slice().reverse().map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                  <p className="text-sm text-gray-500">{step.note}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(step.at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {shipment.returnReason && (
        <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Return / Failure Reason</p>
              <p className="text-sm text-red-600 mt-1">{shipment.returnReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentCard;