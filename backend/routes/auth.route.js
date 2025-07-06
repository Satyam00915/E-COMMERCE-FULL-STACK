import { Router } from "express";
import { logout, refreshToken, signin, signup } from "../controllers/auth.controller.js";
const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/logout", logout);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
