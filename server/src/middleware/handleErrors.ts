import {Request, Response, NextFunction} from "express";
import statusCodes from "http-status-codes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function handleErrors (error: Error, request: Request, response: Response, next: NextFunction) {
	const message = error.message || "Unknown Error";

	if (error.name === "BadRequest") {
		response.status(statusCodes.BAD_REQUEST);
	} else if (error.name === "OperationDenied") {
		response.status(statusCodes.UNAUTHORIZED);
	} else {
		response.status(statusCodes.INTERNAL_SERVER_ERROR);
	}

	response.json(message);
}