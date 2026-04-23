import {Request, Response} from "express";
import statusCodes from "http-status-codes";
import Positions from "../services/Positions.js";
import {AuthorizedRequest} from "../middleware/authorize.js";

export async function getPositions (request: Request, response: Response) {
	response.status(404);
	response.send("endpoint not implemented");
}

export async function createPosition (request: Request, response: Response) {
	response.status(statusCodes.CREATED)
		.json(await positions(request).create(request.body));
}

export async function getPositionById (request: Request, response: Response) {
	response.json(await positions(request).getById(getPositionId(request)));
}

export async function updatePosition (request: Request, response: Response) {
	response.json(await positions(request).update(getPositionId(request), request.body));
}

export async function patchPosition (request: Request, response: Response) {
	response.status(404);
	response.send("endpoint not implemented");
}

export async function removePosition (request: Request, response: Response) {
	await positions(request).remove(getPositionId(request));

	response.sendStatus(statusCodes.NO_CONTENT);
}

function positions (request: AuthorizedRequest) {
	const user = request.user;

	if (!user) {
		throw new Error("User must be set in path before accessing positions");
	}

	return new Positions(user.id);
}

function getPositionId (request: Request) {
	if (!request.params.positionId) {
		throw new Error("need position id");
	}

	return Number(request.params.positionId);
}