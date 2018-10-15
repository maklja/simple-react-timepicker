import HourValidator from '../../../js/utils/parser/validator/HourValidator';
import MinSecValidator from '../../../js/utils/parser/validator/MinSecValidator';
import MillisecondValidator from '../../../js/utils/parser/validator/MillisecondValidator';

describe('test hour validator', () => {
	const validator = new HourValidator();

	test('check supported types', () => {
		['HH', 'H', 'hh', 'h'].forEach(curFormatPart => {
			expect(validator.isTypeSupported(curFormatPart)).toBeTruthy();
		});
	});

	test('validate hour value 12 in hh format', () => {
		expect(validator.validate(12, 'hh')).toBeTruthy();
	});

	test('validate hour value 8 in hh format', () => {
		expect(validator.validate(8, 'hh')).toBeTruthy();
	});

	test('validate hour value -8 in hh format', () => {
		expect(validator.validate(-8, 'hh')).toBeFalsy();
	});

	test('validate hour value 32 in hh format', () => {
		expect(validator.validate(32, 'hh')).toBeFalsy();
	});

	test('validate hour value 8 in h format', () => {
		expect(validator.validate(8, 'h')).toBeTruthy();
	});
});

describe('test minute and second validator', () => {
	const validator = new MinSecValidator();

	test('check supported types', () => {
		['MM', 'M', 'ss', 's'].forEach(curFormatPart => {
			expect(validator.isTypeSupported(curFormatPart)).toBeTruthy();
		});
	});

	test('validate minute value 12 in MM format', () => {
		expect(validator.validate(12, 'MM')).toBeTruthy();
	});

	test('validate minute value 8 in MM format', () => {
		expect(validator.validate(8, 'MM')).toBeTruthy();
	});

	test('validate minute value -8 in MM format', () => {
		expect(validator.validate(-8, 'MM')).toBeFalsy();
	});

	test('validate minute value 65 in MM format', () => {
		expect(validator.validate(65, 'MM')).toBeFalsy();
	});

	test('validate minute value 8 in M format', () => {
		expect(validator.validate(8, 'M')).toBeTruthy();
	});

	test('validate second value 12 in ss format', () => {
		expect(validator.validate(12, 'ss')).toBeTruthy();
	});

	test('validate second value 8 in ss format', () => {
		expect(validator.validate(8, 'ss')).toBeTruthy();
	});
});

describe('test millisecond validator', () => {
	const validator = new MillisecondValidator();

	test('check supported types', () => {
		['l', 'L'].forEach(curFormatPart => {
			expect(validator.isTypeSupported(curFormatPart)).toBeTruthy();
		});
	});

	test('validate millisecond value 123 in l format', () => {
		expect(validator.validate(123, 'l')).toBeTruthy();
	});

	test('validate millisecond value 88 in l format', () => {
		expect(validator.validate(88, 'l')).toBeTruthy();
	});

	test('validate millisecond value -8 in l format', () => {
		expect(validator.validate(-8, 'l')).toBeFalsy();
	});

	test('validate millisecond value 3210 in l format', () => {
		expect(validator.validate(3210, 'l')).toBeFalsy();
	});

	test('validate millisecond value 8 in L format', () => {
		expect(validator.validate(88, 'L')).toBeTruthy();
	});

	test('validate millisecond value 888 in L format', () => {
		expect(validator.validate(888, 'L')).toBeFalsy();
	});
});
