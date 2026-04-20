import sql from "./sql.js";

export default class Authentication {
	async getUser (username: string): Promise<User|undefined> {
		const [user] = await sql<User[]>`
			SELECT id,
				username,
				password
			
			FROM users

			WHERE username = ${username}
		`;

		return user;
	}
}

type User = {
	id: number,
	username: string,
	password: string
};