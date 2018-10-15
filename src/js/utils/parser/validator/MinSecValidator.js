import Validator from './Validator';

export default class MinSecValidator extends Validator {
	constructor() {
		super(['MM', 'M', 'ss', 's']);
	}

	validate(value, type) {
		const val = parseInt(value);
		if (Number.isNaN(val)) {
			return false;
		}

		switch (type) {
			case 'MM':
			case 'M':
			case 'ss':
			case 's':
				return val >= 0 && val <= 59;
		}

		return false;
	}
}
