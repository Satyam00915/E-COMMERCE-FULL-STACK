import { Router } from "express";
import { logout, signin, signup } from "../controllers/auth.controller.js";
const authRouter = Router();

authRouter.get("/signup", signup);
authRouter.get("/signin", signin);
authRouter.get("/logout", logout);

export default authRouter;
