import React from "react";
import ShipmentCard from "./ShipmentCard";
import { Package } from "lucide-react";

const DeliveryShipmentsList = ({ shipments, onRefresh }) => {
  if (!shipments.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm text-center">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">No shipments assigned yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Once a shop marks an order as ready and you are assigned, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <ShipmentCard
          key={shipment._id}
          shipment={shipment}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default DeliveryShipmentsList;