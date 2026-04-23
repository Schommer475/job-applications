export default class NotFound extends Error {
	constructor (resource: string) {
		Object.freeze(super(resource + " not found"));
	}

	get name () {
		return this.constructor.name;
	}
}