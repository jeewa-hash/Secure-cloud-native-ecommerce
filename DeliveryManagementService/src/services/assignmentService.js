import DeliveryPerson from "../models/DeliveryPerson.js";
import Shipment from "../models/Shipment.js";

const ACTIVE_SHIPMENT_STATUSES = [
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "RETURN_IN_TRANSIT",
];

export const assignOrderToDeliveryPerson = async ({
  orderId,
  zipCode,
  address,
  phone,
}) => {
  if (!orderId || !zipCode) {
    throw new Error("orderId and zipCode are required.");
  }

  const existingShipment = await Shipment.findOne({ orderId });

  if (existingShipment) {
    return {
      assigned: true,
      message: "Shipment already exists for this order.",
      shipment: existingShipment,
    };
  }

  const candidates = await DeliveryPerson.find({
    zipCode,
    isActive: true,
    availabilityStatus: { $ne: "OFFLINE" },
  });

  if (!candidates.length) {
    return {
      assigned: false,
      message: "No delivery person available for this zip code.",
    };
  }

  const candidatesWithLoad = await Promise.all(
    candidates.map(async (person) => {
      const activeShipmentCount = await Shipment.countDocuments({
        deliveryPersonId: person._id,
        status: { $in: ACTIVE_SHIPMENT_STATUSES },
      });

      return {
        person,
        activeShipmentCount,
      };
    })
  );

  candidatesWithLoad.sort((a, b) => {
    if (a.activeShipmentCount !== b.activeShipmentCount) {
      return a.activeShipmentCount - b.activeShipmentCount;
    }

    return new Date(a.person.createdAt) - new Date(b.person.createdAt);
  });

  const selected = candidatesWithLoad[0].person;

  const shipment = await Shipment.create({
    orderId,
    deliveryPersonId: selected._id,
    zipCode,
    address,
    phone,
    status: "ASSIGNED",
    trackingSteps: [
      {
        label: "Assigned",
        note: "Delivery person assigned automatically",
        at: new Date(),
      },
    ],
  });

  selected.availabilityStatus = "BUSY";
  await selected.save();

  return {
    assigned: true,
    message: "Delivery person assigned successfully.",
    shipment,
    deliveryPerson: selected,
  };
};