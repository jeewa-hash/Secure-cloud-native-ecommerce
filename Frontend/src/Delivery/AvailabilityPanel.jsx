import React, { useState } from "react";
import { updateAvailabilityStatus } from "../services/deliveryApi";

const AvailabilityPanel = ({ profile, onRefresh }) => {
  const [selectedStatus, setSelectedStatus] = useState(
    profile?.availabilityStatus || "AVAILABLE"
  );
  const [loading, setLoading] = useState(false);

  const statuses = ["AVAILABLE", "BUSY", "OFFLINE"];

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateAvailabilityStatus(selectedStatus);
      alert("Availability updated successfully.");
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Availability</h2>
      <p className="text-gray-500 mb-6">
        Change your delivery availability status here.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-2xl font-medium border transition-all ${
              selectedStatus === status
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-70"
      >
        {loading ? "Updating..." : "Save Availability"}
      </button>
    </div>
  );
};

export default AvailabilityPanel;