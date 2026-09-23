import Notification from "../models/notificationModel.js";

export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    console.log("Notification saved:", notification._id);
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { recipientId } = req.params;

    // Security Check: Verify authenticated user matches requested recipientId or is admin (Fix V07: IDOR)
    if (req.user.id !== recipientId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied: You are not authorized to access another recipient's notifications."
      });
    }

    const notifications = await Notification.find({ recipientId });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};