import express from "express";
import validateSchema from "../middleware/validateSchema.js";
import {loginInput} from "../schemas/login.js";
import {loginUser} from "../controllers/login.js";

const router = express.Router();

export default router;

router.post("/", validateSchema(loginInput), loginUser);