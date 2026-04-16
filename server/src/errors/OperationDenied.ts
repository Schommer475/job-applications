export default class OperationDenied extends Error {
	constructor (message: string) {
		Object.freeze(super(message));
	}

	get name () {
		return this.constructor.name;
	}
}