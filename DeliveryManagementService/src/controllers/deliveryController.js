import DeliveryPerson from "../models/DeliveryPerson.js";

export const createDeliveryProfile = async (req, res) => {
  try {
    const { phone, zipCode, city, vehicleType, vehicleNumber } = req.body;

    if (!phone || !zipCode || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone, zip code, and vehicle number are required.",
      });
    }

    const existingProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Delivery profile already exists.",
      });
    }

    const deliveryProfile = await DeliveryPerson.create({
      userId: req.userId,
      phone,
      zipCode,
      city,
      vehicleType,
      vehicleNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery profile created successfully.",
      profile: deliveryProfile,
    });
  } catch (error) {
    console.error("Create delivery profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create delivery profile.",
      error: error.message,
    });
  }
};

export const getMyDeliveryProfile = async (req, res) => {
  try {
    const profile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get delivery profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery profile.",
      error: error.message,
    });
  }
};

export const updateMyDeliveryProfile = async (req, res) => {
  try {
    const { phone, zipCode, city, vehicleType, vehicleNumber, isActive } = req.body;

    const profile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    if (phone !== undefined) profile.phone = phone;
    if (zipCode !== undefined) profile.zipCode = zipCode;
    if (city !== undefined) profile.city = city;
    if (vehicleType !== undefined) profile.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) profile.vehicleNumber = vehicleNumber;
    if (isActive !== undefined) profile.isActive = isActive;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Delivery profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update delivery profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery profile.",
      error: error.message,
    });
  }
};

export const updateAvailabilityStatus = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    const allowedStatuses = ["AVAILABLE", "BUSY", "OFFLINE"];

    if (!allowedStatuses.includes(availabilityStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status.",
      });
    }

    const profile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    profile.availabilityStatus = availabilityStatus;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Availability status updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update availability status.",
      error: error.message,
    });
  }
};