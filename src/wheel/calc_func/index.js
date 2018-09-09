export const sliceAroundMiddle = (values, n) => {
	const middleValueIndex = Math.round(values.length / 2);
	const beginIndex = middleValueIndex - n;
	const endIndex = middleValueIndex + n;

	return values.slice(beginIndex < 0 ? 0 : beginIndex, endIndex);
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

export const duplicateArrayValues = (values, maxLength, fromIndex) => {
	// create copy of the current values
	let valuesCopy = [...values];

	valuesCopy = arrayRotate(valuesCopy, false, fromIndex);

	// maxValues number represent number of visible elements during selection mode
	// if array doesn't have enough elements we need to clone them multiple times in
	// order to satisfy maxValuesNumber condition
	while (valuesCopy.length <= maxLength) {
		valuesCopy = valuesCopy.concat(valuesCopy);
	}

	// rotate elements in the array so the first element is in the center of the array
	return valuesCopy;
};

export const roundValueByStep = (val, step) => Math.round(val / step) * step;

export const nextTranslate = (translate, elementHeight, direction, n) =>
	translate + n * elementHeight * direction;

export const nextOffset = (offset, elementHeight, direction, n) =>
	offset - n * elementHeight * direction;

export const windowAvailableSpace = (
	elementHeight,
	n,
	boundingBox,
	windowSize,
	padding = 10
) => {
	let { top, bottom } = boundingBox;
	const { height } = windowSize;

	top += -padding;
	bottom += padding;
	// calculate top available space
	// calculate how many elements can fit before time picker
	const maxSpaceTop = Math.min(n, Math.round(top / elementHeight));
	const offsetTop = maxSpaceTop * elementHeight;

	// calculate bottom available space
	// calculate how many elements can fit after time picker
	const maxSpaceBottom = Math.min(
		n,
		Math.round(Math.abs(height - bottom) / elementHeight)
	);

	const offsetBottom = (n - maxSpaceBottom) * elementHeight * -1;

	return {
		maxSpaceTop,
		maxSpaceBottom,
		offsetTop,
		offsetBottom
	};
};

export const translateInsufficientBottomSpace = (
	values,
	translate,
	offset,
	direction,
	selectedIndex,
	elementHeight,
	n,
	maxSpace
) => {
	// there is only change that there is no space before or after wheel, but not both, atleast in theory
	// bottom
	// translate values to new position so that all values are visible
	const spaceDelta = n - maxSpace;

	return {
		// translate to new value
		translate: nextTranslate(
			translate,
			elementHeight,
			direction,
			spaceDelta
		),
		// change offset to simulate animation transition
		offsetHeight: nextOffset(offset, elementHeight, direction, spaceDelta),
		// rotate values for n places in order to position at new value
		values: arrayRotate(values, direction > 0, spaceDelta),
		// new selected index
		selectedIndex: selectedIndex + spaceDelta * direction
	};
};

export const translateInsufficientTopSpace = (
	values,
	translate,
	offset,
	direction,
	selectedIndex,
	elementHeight,
	n,
	maxSpace
) => {
	const spaceDelta = n - maxSpace;

	return {
		// translate to new value
		translate: nextTranslate(
			translate,
			elementHeight,
			-direction,
			spaceDelta
		),
		// change offset to simulate animation transition
		offsetHeight: nextOffset(offset, elementHeight, -direction, spaceDelta),
		// rotate values for n places in order to position at new value
		values: arrayRotate(values, -direction > 0, spaceDelta),
		// new selected index
		selectedIndex: selectedIndex - spaceDelta * direction
	};
};

export const translateInsufficientSpace = (
	values,
	translate,
	offset,
	direction,
	selectedIndex,
	elementHeight,
	n,
	maxSpaceBottom,
	maxSpaceTop
) => {
	if (maxSpaceBottom !== n) {
		return translateInsufficientBottomSpace(
			values,
			translate,
			offset,
			direction,
			selectedIndex,
			elementHeight,
			n,
			maxSpaceBottom
		);
		// top
	} else if (maxSpaceTop !== n) {
		return translateInsufficientTopSpace(
			values,
			translate,
			offset,
			direction,
			selectedIndex,
			elementHeight,
			n,
			maxSpaceTop
		);
	}

	return null;
};

export const convertPostionToTranslate = (
	newPosition,
	prevPosition,
	currentTranslate
) => newPosition + currentTranslate - prevPosition;

export const nextTranslateDelta = (prevDelta, newTranslate, prevTranslate) =>
	prevDelta + newTranslate - prevTranslate;

export const isInsideElement = (elementTop, elementHeight, positionY) =>
	elementTop <= positionY && positionY <= elementTop + elementHeight;
