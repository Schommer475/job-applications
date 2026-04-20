import express from "express";
import validateSchema from "../middleware/validateSchema.js";
import {positionInput} from "../schemas/positions.js";
import {
	getPositions,
	createPosition,
	getPositionById,
	updatePosition,
	patchPosition,
	removePosition
} from "../controllers/positions.js";

const router = express.Router();

export default router;

// TODO cache
router.route("/").get(getPositions)
	.post(validateSchema(positionInput), createPosition);

router.route("/:positionId")
	.get(getPositionById)
	.put(validateSchema(positionInput), updatePosition)
	// TODO schema
	.patch(patchPosition)
	.delete(removePosition);