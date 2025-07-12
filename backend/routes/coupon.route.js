import { Router } from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { createnewCoupon, getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const couponRouter = Router();

couponRouter.get("/", protectRoute, getCoupon);
couponRouter.get("/validate", protectRoute, validateCoupon);
couponRouter.post("/newCoupon", protectRoute, adminRoute, createnewCoupon);

export default couponRouter;
