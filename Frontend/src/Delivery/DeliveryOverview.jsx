import React from "react";
import { Bike, CheckCircle2, Clock3, MapPinned } from "lucide-react";

const DeliveryOverview = ({ profile, shipments }) => {
  const activeShipments = shipments.filter((s) =>
    ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "RETURN_IN_TRANSIT"].includes(s.status)
  ).length;

  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;

  const cards = [
    {
      title: "Availability",
      value: profile?.availabilityStatus || "AVAILABLE",
      icon: Clock3,
      accent: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Vehicle Type",
      value: profile?.vehicleType || "-",
      icon: Bike,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Zip Code",
      value: profile?.zipCode || "-",
      icon: MapPinned,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Active Shipments",
      value: activeShipments,
      icon: CheckCircle2,
      accent: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-[#fff8f3] via-white to-[#fff4ec] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600 mb-2">
              Delivery Workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Welcome back, Delivery Partner
            </h1>
            <p className="text-gray-600 mt-3 max-w-2xl">
              Manage your deliveries, view assigned shipments, and keep your status up to date.
            </p>
          </div>

          <div className="bg-white border border-orange-100 rounded-2xl px-5 py-4 shadow-sm min-w-[220px]">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Delivered Orders
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {deliveredCount}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <h3 className={`text-xl font-bold mt-2 ${card.accent}`}>
                    {card.value}
                  </h3>
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}
                >
                  <Icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryOverview;
