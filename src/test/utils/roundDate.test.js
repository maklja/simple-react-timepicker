import { roundDate } from '../../js/utils/helper';

test('use default step  values for roundDate function', () => {
	const mockDate = new Date('Wed Mar 25 2015 01:00:00');

	expect(roundDate(mockDate)).toEqual(mockDate);
});

test('round hour with step value 5', () => {
	const mockDate = new Date('Wed Mar 25 2015 04:00:00');

	expect(roundDate(mockDate, 5)).toEqual(
		new Date('Wed Mar 25 2015 05:00:00')
	);
});

test('round hour with step value 5 and minute with step value 10', () => {
	const mockDate = new Date('Wed Mar 25 2015 04:18:00');

	expect(roundDate(mockDate, 5, 10)).toEqual(
		new Date('Wed Mar 25 2015 05:20:00')
	);
});

test('round hour with step value 5, minute with step value 10, second with value 7 and millisecond with value 200', () => {
	const mockDate = new Date('Wed Mar 25 2015 04:18:9.101');

	expect(roundDate(mockDate, 5, 10, 7, 200)).toEqual(
		new Date('Wed Mar 25 2015 05:20:07.200')
	);
});
