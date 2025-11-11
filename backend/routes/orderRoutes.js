import express from "express";
import {
  placeOrder,
  getPendingOrders,
  getCartOrders,
  confirmOrder,
  getKitchenOrders,
  completeOrder,
  getCompletedOrders,
  getOrderById,
  sendInvoiceToWhatsApp,
} from "../controllers/orderController.js";

const router = express.Router();

// Orders
router.post("/place", placeOrder);
router.get("/pending", getPendingOrders);
router.get("/cart", getCartOrders);
router.patch("/confirm/:id", confirmOrder);
router.get("/kitchen", getKitchenOrders);
router.patch("/complete/:id", completeOrder);
router.get("/completed", getCompletedOrders);

// Single order
router.get("/:id", getOrderById);

// Invoice
router.post("/send-invoice/:orderId", sendInvoiceToWhatsApp);

export default router;
