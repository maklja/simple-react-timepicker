import { timeFormater } from '../../js/utils/helper';

test('format string hour without leading zero', () => {
	const formater = timeFormater(2);
	const hour = '2';

	expect(formater(hour)).toBe('02');
});

test('format number hour without leading zero', () => {
	const formater = timeFormater(2);
	const hour = 2;

	expect(formater(hour)).toBe('02');
});

test('format millisecond without leading zeros', () => {
	const formater = timeFormater(3);
	const millisecond = 9;

	expect(formater(millisecond)).toBe('009');
});

test('format already formated value', () => {
	const formater = timeFormater(3);
	const millisecond = '009';

	expect(formater(millisecond)).toBe('009');
});

test('negative number as formater parameter', () => {
	const formater = timeFormater(-3);
	const millisecond = '009';

	expect(formater(millisecond)).toBe('009');
});
