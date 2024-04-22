import express from "express";
import { requireSignin } from "../middlewares/page.js"
import { currentUserController, loginController, passwordResetController, registerController } from "../DNS_Controller/authController.js";
const router = express.Router();


router.post("/Login", loginController);

router.post("/Register", registerController);

router.get("/currentuser", requireSignin, currentUserController)

router.post("/forgotPassword", passwordResetController)

export default router