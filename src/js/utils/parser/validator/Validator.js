export default class Validator {
	get tokenTypes() {
		return this._tokenTypes;
	}

	constructor(tokenTypes) {
		this._tokenTypes = tokenTypes;
	}

	validate(value, type) {
		return false;
	}

	isTypeSupported(type) {
		return this._tokenTypes.includes(type);
	}
}
