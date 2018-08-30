export const infinitiveInvoke = (
	callback,
	conditionCallback,
	args,
	delay = 150
) => {
	let timeoutId = null;

	const autoInvoke = (callback, conditionCallback, args, delay = 150) => {
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

export const arrayRotateOne = (arr, reverse) => {
	const cloneArr = [...arr];
	if (reverse) {
		cloneArr.unshift(cloneArr.pop());
	} else {
		cloneArr.push(cloneArr.shift());
	}

	return cloneArr;
};
