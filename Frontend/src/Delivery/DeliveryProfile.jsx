import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  Phone,
  MapPin,
  MapPinned,
  Bike,
  BadgeInfo,
  CheckCircle2,
  Pencil,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react";
import config from "../config";

const DELIVERY_API_URL = config.DELIVERY_API;

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="bg-orange-50 p-2 rounded-lg mt-0.5">
      <Icon className="w-4 h-4 text-orange-500" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

const DeliveryProfile = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [toggling, setToggling] = useState(false);
  const [form, setForm]         = useState({
    phone: "", city: "", zipCode: "", vehicleType: "bike", vehicleNumber: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${DELIVERY_API_URL}/delivery-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.person) {
        setProfile(res.data.person);
        setForm({
          phone:         res.data.person.phone        || "",
          city:          res.data.person.city         || "",
          zipCode:       res.data.person.zipCode       || "",
          vehicleType:   res.data.person.vehicleType   || "bike",
          vehicleNumber: res.data.person.vehicleNumber || "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMsg("");
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${DELIVERY_API_URL}/delivery-profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, ...form }));
        setSaveMsg("Profile updated successfully!");
        setEditing(false);
      }
    } catch (err) {
      setSaveMsg(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      setToggling(true);
      const token = localStorage.getItem("token");
      const newVal = !profile.isAvailable;
      await axios.patch(
        `${DELIVERY_API_URL}/delivery-profile/availability`,
        { isAvailable: newVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((prev) => ({ ...prev, isAvailable: newVal }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle availability.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );

  if (error && !profile) return (
    <div className="bg-white rounded-3xl border border-red-100 p-8 text-center shadow-sm">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-red-600 font-medium">{error}</p>
      <button onClick={fetchProfile} className="mt-4 text-sm text-orange-600 hover:underline flex items-center gap-1 mx-auto">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery Profile</h2>
            <p className="text-gray-500 text-sm mt-0.5">Your rider information and settings.</p>
          </div>
        </div>
        <button onClick={fetchProfile} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Avatar Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white flex items-center gap-5">
        <div className="bg-white/20 rounded-full p-5">
          <User className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold truncate">{profile?.name || "Delivery Rider"}</p>
          <p className="text-orange-100 text-sm">{profile?.email || ""}</p>
          {profile?.rating != null && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-semibold">{profile.rating} rating</span>
            </div>
          )}
        </div>
        {/* Availability Toggle */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-xs text-orange-100 font-medium">Available</span>
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className="transition-opacity disabled:opacity-60"
            title="Toggle availability"
          >
            {profile?.isAvailable ? (
              <ToggleRight className="w-9 h-9 text-green-300" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-white/50" />
            )}
          </button>
          <span className={`text-xs font-bold ${profile?.isAvailable ? "text-green-300" : "text-white/60"}`}>
            {profile?.isAvailable ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-gray-900">Rider Details</p>
          {!editing ? (
            <button
              onClick={() => { setEditing(true); setSaveMsg(""); }}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          ) : (
            <button
              onClick={() => { setEditing(false); setSaveMsg(""); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>

        <div className="p-6">
          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field icon={Phone}     label="Mobile Number"  value={profile?.phone} />
              <Field icon={MapPinned} label="City"           value={profile?.city} />
              <Field icon={MapPin}    label="Zip Code"       value={profile?.zipCode} />
              <Field icon={BadgeInfo} label="Vehicle Number" value={profile?.vehicleNumber} />
              <Field icon={Bike}      label="Vehicle Type"   value={profile?.vehicleType ? profile.vehicleType.charAt(0).toUpperCase() + profile.vehicleType.slice(1) : "—"} />
              {profile?.totalDeliveries != null && (
                <Field icon={CheckCircle2} label="Total Deliveries" value={profile.totalDeliveries} />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "phone",         label: "Mobile Number",  icon: Phone,     type: "text",   placeholder: "Enter mobile number" },
                { name: "city",          label: "City",            icon: MapPinned, type: "text",   placeholder: "Enter city" },
                { name: "zipCode",       label: "Zip Code",        icon: MapPin,    type: "text",   placeholder: "Enter zip code" },
                { name: "vehicleNumber", label: "Vehicle Number",  icon: BadgeInfo, type: "text",   placeholder: "Enter vehicle number" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  <div className="relative">
                    <field.icon className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={field.type}
                      value={form[field.name]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              ))}

              {/* Vehicle Type */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vehicle Type</label>
                <div className="relative">
                  <Bike className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                  <select
                    value={form.vehicleType}
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                {saveMsg && (
                  <p className={`text-sm font-medium ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {(profile?.totalDeliveries != null || profile?.rating != null) && (
        <div className="grid grid-cols-2 gap-4">
          {profile.totalDeliveries != null && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-orange-600">{profile.totalDeliveries}</p>
              <p className="text-sm text-gray-500 mt-1">Total Deliveries</p>
            </div>
          )}
          {profile.rating != null && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-1">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                {profile.rating}
              </p>
              <p className="text-sm text-gray-500 mt-1">Average Rating</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryProfile;