import TimeParser from '../../../js/utils/parser/TimeParser';

describe('extract as date', () => {
	describe('test format HH:MM:ss.l', () => {
		const format = 'HH:MM:ss.l';
		const parser = new TimeParser(format);
		const defaultDate = new Date(Date.parse('2005-07-08T11:22:33+0000'));

		test('extract time 12:37:01.233', () => {
			const time = '12:37:01.233';
			const expectedDate = new Date(defaultDate.getTime());
			expectedDate.setHours(12, 37, 1, 233);

			const newDateTime = parser.extractAsDate(time, defaultDate);
			expect(newDateTime).toEqual(expectedDate);
		});

		test('extract time 11:37:01.233', () => {
			const time = '11:37:01.233';
			const expectedDate = new Date(defaultDate.getTime());
			expectedDate.setHours(11, 37, 1, 233);

			const newDateTime = parser.extractAsDate(time, defaultDate);
			expect(newDateTime).toEqual(expectedDate);
		});

		test('try to extract time with wrong format 11:37:01.233 PM', () => {
			const time = '11:37:01.233 PM';

			const newDateTime = parser.extractAsDate(time, defaultDate);
			expect(newDateTime).toBeNull();
		});
	});

	describe('test format hh:M:s.l TT', () => {
		const format = 'hh:M:s.l TT';
		const parser = new TimeParser(format);
		const defaultDate = new Date(Date.parse('2005-07-08T11:22:33+0000'));

		test('extract time 11:6:6.999 PM', () => {
			const time = '11:6:6.999 PM';

			const dateTime = parser.extractAsDate(time, defaultDate);
			expect(dateTime.toISOString()).toEqual('2005-07-08T21:06:06.999Z');
		});

		test('extract time 02:6:6.999 PM', () => {
			const time = '02:6:6.999 PM';

			const dateTime = parser.extractAsDate(time, defaultDate);
			expect(dateTime.toISOString()).toEqual('2005-07-08T12:06:06.999Z');
		});
	});
});

describe('extract time from string', () => {
	describe('test format HH:MM:ss.l', () => {
		const format = 'HH:MM:ss.l';
		const parser = new TimeParser(format);

		test('extract time 12:37:01.233', () => {
			const time = '12:37:01.233';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: false,
				invalidValues: [],
				hour: '12',
				minute: '37',
				second: '01',
				millisecond: '233'
			});
		});

		test('try to extract time with wrong format 11:37:01.233 PM', () => {
			const time = '11:37:01.233 PM';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: true,
				invalidValues: ['format']
			});
		});

		test('extract time with hour 32, 32:37:01.233', () => {
			const time = '32:37:01.233';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: true,
				invalidValues: ['hour'],
				hour: '32',
				minute: '37',
				second: '01',
				millisecond: '233'
			});
		});

		test('extract time with minute 60, 18:60:01.233', () => {
			const time = '18:60:01.233';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: true,
				invalidValues: ['minute'],
				hour: '18',
				minute: '60',
				second: '01',
				millisecond: '233'
			});
		});

		test('extract time with minute 60 and second 60, 18:60:60.233', () => {
			const time = '18:60:60.233';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: true,
				invalidValues: ['minute', 'second'],
				hour: '18',
				minute: '60',
				second: '60',
				millisecond: '233'
			});
		});

		test('extract time with minute 00, second 00 and milliseconds 000, 18:00:00.000', () => {
			const time = '18:00:00.000';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: false,
				invalidValues: [],
				hour: '18',
				minute: '00',
				second: '00',
				millisecond: '000'
			});
		});
	});

	describe('test format hh:M:s.l TT', () => {
		const format = 'hh:M:s.l TT';
		const parser = new TimeParser(format);

		test('extract time 11:6:6.999 AM', () => {
			const time = '11:6:6.999 AM';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: false,
				invalidValues: [],
				hour: '11',
				minute: '6',
				second: '6',
				millisecond: '999',
				meridiem: 'AM'
			});
		});

		test('extract time 11:0:0.000 AM', () => {
			const time = '11:0:0.000 AM';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: false,
				invalidValues: [],
				hour: '11',
				minute: '0',
				second: '0',
				millisecond: '000',
				meridiem: 'AM'
			});
		});

		test('try extract time with invalid hour, 17:6:6.999 AM', () => {
			const time = '17:6:6.999 AM';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: true,
				invalidValues: ['hour'],
				hour: '17',
				minute: '6',
				second: '6',
				millisecond: '999',
				meridiem: 'AM'
			});
		});

		test('try to extract time with invalid meridiem, 12::6:6.999 AA', () => {
			const time = '12:6:6.999 AA';

			const timeValues = parser.extractTime(time);
			expect(timeValues).toEqual({
				isInvalid: true,
				invalidValues: ['format']
			});
		});
	});
});

describe('unsafe time parser validate unsafe time format', () => {
	test('validate unsafe format hhhMMM:ss', () => {
		const format = 'hhhMMM:ss';
		expect(TimeParser.validateFormat(format)).toBeFalsy();
	});

	test('validate unsafe format hh:hMMM:ss', () => {
		const format = 'hh:hMMM:ss';
		expect(TimeParser.validateFormat(format)).toBeFalsy();
	});

	test('validate safe format hh:MMM:s', () => {
		const format = 'hh:MMM:s';
		expect(TimeParser.validateFormat(format)).toBeTruthy();
	});

	test('validate safe format hTTMMM:s', () => {
		const format = 'hTTMMM:s';
		expect(TimeParser.validateFormat(format)).toBeTruthy();
	});

	test('validate safe format hhMMss', () => {
		const format = 'hhMMss';
		expect(TimeParser.validateFormat(format)).toBeTruthy();
	});
});

describe('check time formats', () => {
	describe('check time format hh:MM:ss.l TT', () => {
		const format = 'hh:MM:ss.l TT';
		const parser = new TimeParser(format);

		test('check time 12:02:33.998 AM', () => {
			const time = '12:02:33.998 AM';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time 00:59:12.008 PM', () => {
			const time = '00:59:12.008 PM';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time 6:39:33.108 AM', () => {
			const time = '6:39:33.108 AM';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeFalsy();
		});
	});

	describe('check time format h:M:s.L T', () => {
		const format = 'h:M:s.L T';
		const parser = new TimeParser(format);

		test('check time 12:02:33.99 A', () => {
			const time = '12:02:33.99 A';
			const isValid = parser.checkFormat(time);
			expect(isValid).toBeTruthy();
		});

		test('check time 12:02:33.99 a', () => {
			const time = '12:02:33.99 a';
			const isValid = parser.checkFormat(time);

			// this test will fail because regex is case sensitive
			// and for value T expects 'A' or 'P', not 'a' or 'p'
			expect(isValid).toBeFalsy();
		});

		test('check time 00:59:12.08 P', () => {
			const time = '00:59:12.08 P';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time 6:39:33.18 A', () => {
			const time = '6:39:33.18 A';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time 6:9:3.8 A', () => {
			const time = '6:9:3.28 A';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});
	});

	describe('check time format _h&&M&&s-L_t', () => {
		const format = '_h&&M&&s-L_t';
		const parser = new TimeParser(format);

		test('check time _10&&03&&22-99_a', () => {
			const time = '_10&&03&&22-99_a';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time _10&&03&&22-99_a', () => {
			// missing end time value a
			const time = '_10&&03&&22-99_';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeFalsy();
		});

		test('check time _23&&13&&2-99_p', () => {
			const time = '_23&&13&&2-99_p';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time _2&&1&&2-09_p', () => {
			const time = '_2&&1&&2-09_p';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeTruthy();
		});

		test('check time _2&1&&2-09_p', () => {
			// missing '&' character between hour and minute
			const time = '_2&1&&2-09_p';
			const isValid = parser.checkFormat(time);

			expect(isValid).toBeFalsy();
		});
	});
});

describe('parse time format', () => {
	test('parse default time format hh:MM:ss.l TT', () => {
		const format = 'hh:MM:ss.l TT';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual([
			'hh',
			':',
			'MM',
			':',
			'ss',
			'.',
			'l',
			' ',
			'TT'
		]);
	});

	test('parse short time format HH:MM', () => {
		const format = 'HH:MM';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual(['HH', ':', 'MM']);
	});

	test('parse time format HH&&&MM&&ss', () => {
		const format = 'HH&&&MM&&ss';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual(['HH', '&&&', 'MM', '&&', 'ss']);
	});

	test('parse time format with multiple spaces between', () => {
		const format = '  HH   MM   ss   ';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual(['HH', ' ', 'MM', ' ', 'ss']);
	});

	test('parse time format with random string at the begin and end', () => {
		const format = 'randomHH:MM:ssrandom';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual([
			'random',
			'HH',
			':',
			'MM',
			':',
			'ss',
			'random'
		]);
	});

	test('parse time format h:M:s.L', () => {
		const format = ' h:M:s.L';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual(['h', ':', 'M', ':', 's', '.', 'L']);
	});

	test('parse time format hhh:MMM:sss', () => {
		const format = ' hhh:MMM:sss';
		const parser = new TimeParser(format);

		expect(parser.formatParts).toEqual([
			'hh',
			'h',
			':',
			'MM',
			'M',
			':',
			'ss',
			's'
		]);
	});
});
