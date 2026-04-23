import Data from "../db/Positions.js";
import {PositionInput} from "../schemas/positions.js";
import NotFound from "../errors/NotFound.js";

export default class Positions {
	#data;

	constructor (userId: number) {
		Object.freeze(this);

		this.#data = new Data(userId);
	}

	async get () {
		// TODO
		return [];
	}

	async create (position: PositionInput) {
		return await this.#data.transaction(async () => {
			const id = await this.#data.create(position);

			await Promise.all([
				this.#data.setLinks(id, position.importantLinks),
				this.#data.setInterviews(id, position.interviews)
			]);

			return await this.getById(id);
		});
	}

	async getById (id: number) {
		return await this.#data.transaction(async () => {
			const position = await this.#data.getById(id);

			if (!position) {
				throw new NotFound("Position");
			}

			return Object.assign(position, {
				importantLinks: await this.#data.getLinks(id),
				interviews: await this.#data.getInterviews(id)
			});
		});
	}

	async update (id: number, position: PositionInput) {
		return await this.#data.transaction(async () => {
			// verify the position exists
			await this.getById(id);

			await Promise.all([
				this.#data.update(id, position),
				this.#data.setLinks(id, position.importantLinks),
				this.#data.setInterviews(id, position.interviews)
			]);

			return await this.getById(id);
		});
	}

	// TODO input type
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async patch (id: number) {
		// TODO
	}

	async remove (id: number) {
		await this.#data.transaction(async () => {
			// verify the position exists
			await this.getById(id);
			await this.#data.remove(id);
		});
	}
}