import {Request, Response} from "express";
import Authentication from "../services/Authentication";

export async function loginUser (request: Request, response: Response) {
	response.json({
		token: await authentication().login(request.body)
	});
}

function authentication () {
	return new Authentication();
}