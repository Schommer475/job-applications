export default class Authentication {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async getUser (username: string): Promise<User|undefined> {
		// TODO actually retrieve the stored password
		return;
	}
}

type User = {
	profileId: number,
	userName: string,
	password: string
};