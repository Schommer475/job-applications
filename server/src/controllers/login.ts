import {Request, Response} from "express";
import Authentication from "../services/Authentication.js";

export async function loginUser (request: Request, response: Response) {
	response.cookie("jwt", await authentication().login(request.body), {
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	});
}

function authentication () {
	return new Authentication();
}