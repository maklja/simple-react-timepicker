export const infinitiveInvoke = (
	callback,
	conditionCallback,
	args,
	delay = 250
) => {
	let timeoutId = null;

	const autoInvoke = (callback, conditionCallback, args, delay) => {
		callback(args);

		timeoutId = setTimeout(() => {
			if (conditionCallback()) {
				autoInvoke(callback, conditionCallback, args, delay);
			}
		}, delay);
	};

	autoInvoke(callback, conditionCallback, args, delay);

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

export const timeFormater = val => {
	let s = val + '';
	while (s.length < 2) {
		s = '0' + s;
	}

	return s;
};

export const getWindowSize = () => {
	let width = 0,
		height = 0;
	if (typeof window.innerWidth === 'number') {
		// Non-IE
		width = window.innerWidth;
		height = window.innerHeight;
	} else if (
		document.documentElement &&
		(document.documentElement.clientWidth ||
			document.documentElement.clientHeight)
	) {
		// IE 6+ in 'standards compliant mode'
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	} else if (
		document.body &&
		(document.body.clientWidth || document.body.clientHeight)
	) {
		// IE 4 compatible
		width = document.body.clientWidth;
		height = document.body.clientHeight;
	}

	return { width, height };
};

export const isFunction = func =>
	func && {}.toString.call(func) === '[object Function]';

export const roundDate = (
	dateValue,
	stepHour,
	stepMinute,
	stepSecond,
	stepMilliseconds
) => {
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
