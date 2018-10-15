export const infinitiveInvoke = (callback, args, delay = 250) => {
	args = Array.isArray(args) ? args : [args];
	let timeoutId = null;

	const autoInvoke = (callback, args, delay) => {
		callback(...args);

		timeoutId = setTimeout(() => {
			autoInvoke(callback, args, delay);
		}, delay);
	};

	autoInvoke(callback, args, delay);

	return () => {
		clearTimeout(timeoutId);
	};
};

export const generateArrayValues = (maxValue, step, startValue = 0) => {
	const values = [];
	for (let i = startValue; i < maxValue; i += step) {
		values.push(i);
	}

	return values;
};

export const timeFormater = n => {
	return val => {
		let s = val + '';
		while (s.length < n) {
			s = '0' + s;
		}

		return s;
	};
};

export const roundDate = (
	dateValue,
	stepHour = 1,
	stepMinute = 1,
	stepSecond = 1,
	stepMilliseconds = 1
) => {
	if (dateValue == null) {
		return null;
	}
	// we need to round up sent date in props to respect steps for each time part
	// if we don't do this always after first wheel collapse we will get onChange event
	// even if no changes are made, this is only because rounding of date parts
	let hour = dateValue.getHours(),
		minute = dateValue.getMinutes(),
		second = dateValue.getSeconds(),
		millisecond = dateValue.getMilliseconds();

	hour = Math.round(hour / stepHour) * stepHour;
	minute = Math.round(minute / stepMinute) * stepMinute;
	second = Math.round(second / stepSecond) * stepSecond;
	millisecond = Math.round(millisecond / stepMilliseconds) * stepMilliseconds;

	const newDateValue = new Date(dateValue.getTime());
	newDateValue.setHours(hour, minute, second, millisecond);

	return newDateValue;
};

export const themeClassName = themeName =>
	themeName ? `srtp-theme-${themeName}` : '';

export const defaultTimeFormater = ({
	showHour,
	showMinutes,
	showSeconds,
	showMilliseconds,
	use12Hours
} = {}) => {
	let timeFormat = '';

	if (showHour) {
		timeFormat += use12Hours ? 'hh' : 'HH';
	}

	if (showMinutes) {
		timeFormat += timeFormat.length > 0 ? ':MM' : 'MM';
	}

	if (showSeconds) {
		timeFormat += timeFormat.length > 0 ? ':ss' : 'ss';
	}

	if (showMilliseconds) {
		timeFormat += timeFormat.length > 0 ? '.l' : 'l';
	}

	if (use12Hours) {
		timeFormat += timeFormat.length > 0 ? ' TT' : 'TT';
	}

	return timeFormat;
};

export const isFunction = func =>
	func && {}.toString.call(func) === '[object Function]';
