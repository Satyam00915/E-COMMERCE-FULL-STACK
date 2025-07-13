import { Router } from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const analyticsRouter = Router();

analyticsRouter.get("/", protectRoute, adminRoute, getAnalytics);

export default analyticsRouter;
