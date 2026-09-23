import { assignOrderToDeliveryPerson } from "../services/assignmentService.js";

export const assignOrderInternally = async (req, res) => {
  try {
    const { orderId, zipCode, address, phone } = req.body;

    const result = await assignOrderToDeliveryPerson({
      orderId,
      zipCode,
      address,
      phone,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Internal assignment error:", error);
    return res.status(500).json({
      success: false,
      assigned: false,
      message: "Failed to assign delivery person.",
      error: error.message,
    });
  }
};