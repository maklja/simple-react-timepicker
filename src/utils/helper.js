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
