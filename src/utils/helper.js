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

export const arrayRotate = (arr, reverse, shiftNum = 1) => {
	const cloneArr = [...arr];

	if (reverse) {
		for (let i = 0; i < shiftNum; i++) {
			cloneArr.unshift(cloneArr.pop());
		}
	} else {
		for (let i = 0; i < shiftNum; i++) {
			cloneArr.push(cloneArr.shift());
		}
	}

	return cloneArr;
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
