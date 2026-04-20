import {Request, Response, NextFunction} from "express";
import Authentication from "../services/Authentication.js";
import OperationDenied from "../errors/OperationDenied.js";

export default async function authorize (request: Request, response: Response, next: NextFunction) {
	let token = getToken(request),
		pathProfileId = Number(request.params.profileId),
		profileId;

	if (!token) {
		throw new OperationDenied("Authorization token required");
	}

	({profileId} = await authentication().validateToken(token));

	if (profileId !== pathProfileId) {
		throw new OperationDenied("User does not have access to resource");
	}

	request.user = Object.freeze({profileId});

	next();
}

function authentication () {
	return new Authentication();
}

function getToken (request: Request): string|undefined {
	const cookies = request.headers.cookie?.split(";") ?? [];

	return cookies.filter((cookie: string) => cookie.startsWith("jwt="))
		.map((cookie: string) => cookie.slice(4))
		.shift();
}

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}

type User = {
	profileId: number
}