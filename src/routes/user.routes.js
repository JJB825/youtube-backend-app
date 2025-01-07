import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(registerUser); // whenever router receives control, it will check for /register route and execute the registerUser function for post method

export default router;
