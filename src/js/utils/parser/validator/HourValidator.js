import Validator from './Validator';

export default class HourValidator extends Validator {
	constructor() {
		super(['hh', 'h', 'HH', 'H']);
	}

	validate(value, type) {
		const val = parseInt(value);
		if (Number.isNaN(val)) {
			return false;
		}

		switch (type) {
			case 'hh':
			case 'h':
				return val >= 1 && val <= 12;
			case 'HH':
			case 'H':
				return val >= 0 && val <= 23;
		}

		return false;
	}
}
