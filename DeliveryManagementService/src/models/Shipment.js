import mongoose from "mongoose";

const TrackingStepSchema = new mongoose.Schema({
  label: String,
  note: String,
  at: { type: Date, default: Date.now },
});

const ShipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPerson",
      required: true,
    },
    zipCode: String,
    address: String,
    phone: String,
    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "FAILED",
        "RETURN_IN_TRANSIT",
        "RETURNED_TO_SHOP",
      ],
      default: "ASSIGNED",
    },
    returnReason: String,
    trackingSteps: [TrackingStepSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Shipment", ShipmentSchema);