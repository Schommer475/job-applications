import {Request, Response, NextFunction} from "express";
import Authentication from "../services/Authentication.js";
import OperationDenied from "../errors/OperationDenied.js";

export default async function authorize (request: AuthorizedRequest, response: Response, next: NextFunction) {
	const token = getToken(request),
		pathUserId = Number(request.params.userId),
		{userId} = await authentication().validateToken(token);

	if (userId !== pathUserId) {
		throw new OperationDenied("User does not have access to resource");
	}

	request.user = Object.freeze({
		id: userId
	});

	next();
}

function authentication () {
	return new Authentication();
}

function getToken (request: Request): string {
	const cookies = request.headers.cookie?.split(";") ?? [],
		token = cookies.filter((cookie: string) => cookie.startsWith("jwt="))
			.map((cookie: string) => cookie.slice(4))
			.shift();

	if (!token) {
		throw new OperationDenied("Authorization token required");
	}

	return token;
}

export interface AuthorizedRequest extends Request {
	user?: User
}

type User = {
	id: number
}