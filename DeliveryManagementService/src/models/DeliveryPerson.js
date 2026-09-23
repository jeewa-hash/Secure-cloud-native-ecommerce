import mongoose from "mongoose";

const DeliveryPersonSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car", "van"],
      default: "bike",
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "AVAILABLE",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryPerson", DeliveryPersonSchema);