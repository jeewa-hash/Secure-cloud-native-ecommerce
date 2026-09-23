import React, { useEffect, useState } from "react";
import { getMyDeliveryProfile } from "../services/deliveryApi";
import CreateDeliveryProfile from "../Delivery/CreateDeliveryProfile";
import DeliveryDashboard from "../Delivery/DeliveryDashboard";

const DeliveryLandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyDeliveryProfile();

      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading delivery workspace...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <CreateDeliveryProfile onProfileCreated={fetchProfile} />;
  }

  return <DeliveryDashboard profile={profile} onProfileRefresh={fetchProfile} />;
};

export default DeliveryLandingPage;
