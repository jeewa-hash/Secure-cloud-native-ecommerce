import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Clock3,
} from "lucide-react";

import { logoutUser } from "../utils/auth";
import { getMyShipments } from "../services/deliveryApi";
import DeliveryOverview from "../Delivery/DeliveryOverview";
import DeliveryShipmentsList from "../Delivery/DeliveryShipmentsList";
import DeliveryProfilePanel from "../Delivery/DeliveryProfilePanel";
import AvailabilityPanel from "../Delivery/AvailabilityPanel";

const DeliveryDashboard = ({ profile, onProfileRefresh }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoadingShipments(true);
      const res = await getMyShipments();
      setShipments(res.data.shipments || []);
    } catch (error) {
      setShipments([]);
    } finally {
      setLoadingShipments(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "shipments", label: "My Shipments", icon: Package },
    { id: "profile", label: "My Profile", icon: User },
    { id: "availability", label: "Availability", icon: Clock3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DeliveryOverview profile={profile} shipments={shipments} />;

      case "shipments":
        if (loadingShipments) {
          return (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm text-center">
              <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading shipments...</p>
            </div>
          );
        }

        return (
          <DeliveryShipmentsList
            shipments={shipments}
            onRefresh={fetchShipments}
          />
        );

      case "profile":
        return (
          <DeliveryProfilePanel
            profile={profile}
            onRefresh={onProfileRefresh}
          />
        );

      case "availability":
        return (
          <AvailabilityPanel
            profile={profile}
            onRefresh={onProfileRefresh}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      

      <div className="flex flex-1 min-h-0">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out flex flex-col
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Workspace
                </p>
                <h2 className="text-lg font-bold text-gray-900">Delivery Hub</h2>
              </div>
            </div>

            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-orange-50 text-orange-600 border border-orange-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-orange-600" : "text-gray-400"
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboard;