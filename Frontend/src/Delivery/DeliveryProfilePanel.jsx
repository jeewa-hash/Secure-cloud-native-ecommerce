import React, { useState } from "react";
import { updateMyDeliveryProfile } from "../services/deliveryApi";

const DeliveryProfilePanel = ({ profile, onRefresh }) => {
  const [formData, setFormData] = useState({
    phone: profile?.phone || "",
    zipCode: profile?.zipCode || "",
    city: profile?.city || "",
    vehicleType: profile?.vehicleType || "bike",
    vehicleNumber: profile?.vehicleNumber || "",
    isActive: profile?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await updateMyDeliveryProfile(formData);
      alert("Profile updated successfully.");
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
      <p className="text-gray-500 mb-6">
        Update your delivery profile details here.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-600"
        />

        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="Zip Code"
          className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-600"
        />

        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-600"
        />

        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-600"
        >
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="car">Car</option>
          <option value="van">Van</option>
        </select>

        <input
          type="text"
          name="vehicleNumber"
          value={formData.vehicleNumber}
          onChange={handleChange}
          placeholder="Vehicle Number"
          className="md:col-span-2 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-600"
        />

        <label className="md:col-span-2 flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          Keep profile active
        </label>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-black text-white font-semibold py-3.5 rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-70"
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default DeliveryProfilePanel;