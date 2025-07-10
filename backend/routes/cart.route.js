import { Router } from "express";
import {
  addToCart,
  getCartProducts,
  removeAllItemsFromCart,
  removeItemFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

cartRouter.get("/", protectRoute, getCartProducts);
cartRouter.post("/", protectRoute, addToCart);
cartRouter.delete("/removeAll", protectRoute, removeAllItemsFromCart);
cartRouter.delete("/", protectRoute, removeItemFromCart);
cartRouter.put("/:id", protectRoute, updateQuantity);

export default cartRouter;
