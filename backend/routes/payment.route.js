import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  createSuccessSession,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post(
  "/create-checkout-session",
  protectRoute,
  createCheckoutSession
);

paymentRouter.post("/checkout-success", protectRoute, createSuccessSession);

export default paymentRouter;
