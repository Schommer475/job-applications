import express from "express";
import validateSchema from "../middleware/validateSchema";
import {loginInput} from "../schemas/login";

const router = express.Router();

export default router;

router.post("/", validateSchema(loginInput));