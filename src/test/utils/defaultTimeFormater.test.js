import { defaultTimeFormater } from '../../js/utils/helper';

test('defaultTimeFormater without parameters', () => {
	expect(defaultTimeFormater()).toBe('');
});

test('defaultTimeFormater show only 24 hour format', () => {
	expect(
		defaultTimeFormater({
			showHour: true,
			use12Hours: false
		})
	).toBe('HH');
});

test('defaultTimeFormater show only 12 hour format', () => {
	expect(
		defaultTimeFormater({
			showHour: true,
			use12Hours: true
		})
	).toBe('hh TT');
});

test('defaultTimeFormater show only minutes', () => {
	expect(
		defaultTimeFormater({
			showMinutes: true
		})
	).toBe('MM');
});

test('defaultTimeFormater show only seconds', () => {
	expect(
		defaultTimeFormater({
			showSeconds: true
		})
	).toBe('ss');
});

test('defaultTimeFormater show only milliseconds', () => {
	expect(
		defaultTimeFormater({
			showMilliseconds: true
		})
	).toBe('l');
});

test('defaultTimeFormater show only meridiem', () => {
	expect(
		defaultTimeFormater({
			use12Hours: true
		})
	).toBe('TT');
});

test('defaultTimeFormater show HH:MM:ss.l', () => {
	expect(
		defaultTimeFormater({
			showHour: true,
			showMinutes: true,
			showSeconds: true,
			showMilliseconds: true
		})
	).toBe('HH:MM:ss.l');
});

test('defaultTimeFormater show HH:MM:ss.l TT', () => {
	expect(
		defaultTimeFormater({
			showHour: true,
			showMinutes: true,
			showSeconds: true,
			showMilliseconds: true,
			use12Hours: true
		})
	).toBe('hh:MM:ss.l TT');
});
