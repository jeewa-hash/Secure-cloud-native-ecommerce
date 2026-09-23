import Shipment from "../models/Shipment.js";
import DeliveryPerson from "../models/DeliveryPerson.js";

export const getMyShipments = async (req, res) => {
  try {
    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipments = await Shipment.find({
      deliveryPersonId: deliveryProfile._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    console.error("Get my shipments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipments.",
      error: error.message,
    });
  }
};

export const getMyShipmentById = async (req, res) => {
  try {
    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    console.error("Get shipment by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipment.",
      error: error.message,
    });
  }
};

const appendTrackingStep = (shipment, label, note = "") => {
  shipment.trackingSteps.push({
    label,
    note,
    at: new Date(),
  });
};

export const markShipmentPickedUp = async (req, res) => {
  try {
    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    shipment.status = "PICKED_UP";
    appendTrackingStep(shipment, "Picked Up", "Package picked up from shop");

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipment marked as picked up.",
      shipment,
    });
  } catch (error) {
    console.error("Pickup error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment.",
      error: error.message,
    });
  }
};

export const markShipmentInTransit = async (req, res) => {
  try {
    const { note } = req.body;

    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    shipment.status = "IN_TRANSIT";
    appendTrackingStep(shipment, "In Transit", note || "Shipment is on the way");

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipment marked as in transit.",
      shipment,
    });
  } catch (error) {
    console.error("In-transit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment.",
      error: error.message,
    });
  }
};

export const markShipmentDelivered = async (req, res) => {
  try {
    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    shipment.status = "DELIVERED";
    appendTrackingStep(shipment, "Delivered", "Shipment delivered successfully");

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipment marked as delivered.",
      shipment,
    });
  } catch (error) {
    console.error("Delivered error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment.",
      error: error.message,
    });
  }
};

export const markShipmentFailed = async (req, res) => {
  try {
    const { reason } = req.body;

    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    shipment.status = "FAILED";
    shipment.returnReason = reason || "Delivery attempt failed";
    appendTrackingStep(shipment, "Delivery Failed", reason || "Delivery attempt failed");

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipment marked as failed.",
      shipment,
    });
  } catch (error) {
    console.error("Fail shipment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment.",
      error: error.message,
    });
  }
};

export const markReturnInTransit = async (req, res) => {
  try {
    const { reason } = req.body;

    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    shipment.status = "RETURN_IN_TRANSIT";
    shipment.returnReason = reason || shipment.returnReason;
    appendTrackingStep(shipment, "Return In Transit", reason || "Returning shipment to shop");

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipment marked as return in transit.",
      shipment,
    });
  } catch (error) {
    console.error("Return in transit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment.",
      error: error.message,
    });
  }
};

export const markReturnedToShop = async (req, res) => {
  try {
    const deliveryProfile = await DeliveryPerson.findOne({ userId: req.userId });

    if (!deliveryProfile) {
      return res.status(404).json({
        success: false,
        message: "Delivery profile not found.",
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.params.id,
      deliveryPersonId: deliveryProfile._id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found.",
      });
    }

    shipment.status = "RETURNED_TO_SHOP";
    appendTrackingStep(shipment, "Returned To Shop", "Shipment returned to shop");

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipment marked as returned to shop.",
      shipment,
    });
  } catch (error) {
    console.error("Returned to shop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipment.",
      error: error.message,
    });
  }
};