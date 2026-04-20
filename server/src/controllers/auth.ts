import {Request, Response} from "express";
import Authentication from "../services/Authentication.js";

export async function loginUser (request: Request, response: Response) {
	response.cookie("jwt", await authentication().login(request.body), {
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	});
	response.send("Login Successful");
}

// only clearing the cookie for logout is a deliberate complexity trade-off decision
export async function logoutUser (request: Request, response: Response) {
	response.clearCookie("jwt", {
		httpOnly: true,
		secure: true,
		sameSite: "strict"
	});
	response.send("Logout Successful");
}

function authentication () {
	return new Authentication();
}