import {LoginInput} from "../schemas/login.js";
import Data from "../db/Authentication.js";
import OperationDenied from "../errors/OperationDenied.js";
import bcrypt from "bcrypt";
import jwt, {Secret} from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET as Secret,
	secondsPerMinute = 60,
	secondsPerHour = 60 * secondsPerMinute,
	oneDay = 25 * secondsPerHour;

if (secretKey === undefined) {
	throw new Error("Missing environment variable: JWT_SECRET");
}

export default class Authentication {
	#data: Data;

	constructor () {
		Object.freeze(this);

		this.#data = new Data();
	}

	async login ({username, password}: LoginInput) {
		const {id, password: storedPassword} = await this.#data.getUser(username) ?? {};

		if (!storedPassword || !id) {
			throw new OperationDenied("Username or password is incorrect");
		}

		await validatePassword(password, storedPassword);
		return await generateToken(id);
	}

	async validateToken (token: string): Promise<ParsedToken> {
		return await new Promise((resolve, reject) => jwt.verify(token, secretKey, (err, decoded) => {
			if (err) {
				reject(new OperationDenied("Invalid token"));
			} else {
				resolve(decoded as ParsedToken);
			}
		}));
	}
}

async function validatePassword (plaintextPassword: string, storedPassword: string) {
	if (!await bcrypt.compare(plaintextPassword, storedPassword)) {
		throw new OperationDenied("Username or password is incorrect");
	}
}

async function generateToken (userId: number) {
	return await new Promise((resolve, reject) => {
		jwt.sign({userId}, secretKey, {
			expiresIn: oneDay
		}, (err, signed) => {
			if (err) {
				reject(err);
			} else {
				resolve(signed);
			}
		})
	});
}

type ParsedToken = {
	userId: number
};