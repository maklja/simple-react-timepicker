import Validator from './Validator';

export default class MillisecondValidator extends Validator {
	constructor() {
		super(['l', 'L']);
	}

	validate(value, type) {
		const val = parseInt(value);
		if (Number.isNaN(val)) {
			return false;
		}

		switch (type) {
			case 'l':
				return val >= 0 && val <= 999;
			case 'L':
				return val >= 0 && val <= 99;
		}

		return false;
	}
}
