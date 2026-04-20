import express from "express";
import validateSchema from "../middleware/validateSchema.js";
import {loginInput} from "../schemas/login.js";
import {loginUser, logoutUser} from "../controllers/auth.js";

const router = express.Router();

export default router;

router.post("/login", validateSchema(loginInput), loginUser);
router.post("/logout", logoutUser);