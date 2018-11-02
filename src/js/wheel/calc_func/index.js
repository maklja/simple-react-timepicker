export const sliceAroundMiddle = (values, n = 0) => {
	const middleValueIndex = Math.round(values.length / 2);
	const beginIndex = middleValueIndex - n;
	const endIndex = middleValueIndex + n;

	return values.slice(beginIndex < 0 ? 0 : beginIndex, endIndex);
};

export const arrayRotate = (arr, reverse = false, shiftNum = 1) => {
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

export const duplicateArrayValues = (values, stopLength, fromIndex = 0) => {
	// create copy of the current values
	let valuesCopy = arrayRotate(values, false, fromIndex);

	// maxValues number represent number of visible elements during selection mode
	// if array doesn't have enough elements we need to clone them multiple times in
	// order to satisfy maxValuesNumber condition
	while (valuesCopy.length <= stopLength) {
		valuesCopy = valuesCopy.concat(valuesCopy);
	}

	// rotate elements in the array so the first element is in the center of the array
	return valuesCopy;
};

export const roundValueByStep = (val, step) => Math.round(val / step) * step;

export const TRANSLATE_DIRECTIONS = {
	UP: 1,
	DOWN: -1
};

export const nextTranslate = (translate, elementHeight, direction, n) =>
	translate + n * elementHeight * direction;

export const nextOffset = (offset, elementHeight, direction, n) =>
	offset - n * elementHeight * direction;

export const windowAvailableSpace = (
	elementHeight,
	n,
	boundingBox,
	padding = 10
) => {
	let { top, bottom } = boundingBox;
	const { innerHeight } = window;

	top -= padding;
	bottom += padding;
	// calculate top available space
	// calculate how many elements can fit before time picker
	const maxSpaceTop = Math.min(n, Math.round(top / elementHeight));
	const offsetTop = maxSpaceTop * elementHeight;

	// calculate bottom available space
	// calculate how many elements can fit after time picker
	const maxSpaceBottom = Math.min(
		n,
		Math.round(Math.abs(innerHeight - bottom) / elementHeight)
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
	direction,
	selectedIndex,
	n,
	maxSpace
) => {
	// there is only change that there is no space before or after wheel, but not both, atleast in theory
	// bottom
	// translate values to new position so that all values are visible
	const spaceDelta = n - maxSpace;

	return {
		// rotate values for n places in order to position at new value
		values: arrayRotate(values, direction > 0, spaceDelta),
		// new selected index
		selectedIndex: selectedIndex + spaceDelta * direction
	};
};

export const translateInsufficientTopSpace = (
	values,
	direction,
	selectedIndex,
	n,
	maxSpace
) => {
	const spaceDelta = n - maxSpace;

	return {
		// rotate values for n places in order to position at new value
		values: arrayRotate(values, -direction > 0, spaceDelta),
		// new selected index
		selectedIndex: selectedIndex - spaceDelta * direction
	};
};

export const translateInsufficientSpace = (
	values,
	direction,
	selectedIndex,
	n,
	maxSpaceBottom,
	maxSpaceTop
) => {
	if (maxSpaceBottom !== n) {
		return translateInsufficientBottomSpace(
			values,
			direction,
			selectedIndex,
			n,
			maxSpaceBottom
		);
		// top
	} else if (maxSpaceTop !== n) {
		return translateInsufficientTopSpace(
			values,
			direction,
			selectedIndex,
			n,
			maxSpaceTop
		);
	}

	return null;
};

export const checkInsufficientSpace = (
	elementBoundingRect,
	selectedIndex,
	elementHeight,
	values,
	expandSize,
	direction = 1
) => {
	// get available spaces before and after wheel
	const { maxSpaceTop, maxSpaceBottom } = windowAvailableSpace(
		elementHeight,
		expandSize,
		elementBoundingRect
	);

	return translateInsufficientSpace(
		values,
		direction,
		selectedIndex,
		expandSize,
		maxSpaceBottom,
		maxSpaceTop
	);
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

export const getValueElementByIndex = (el, i) => {
	if (el == null) {
		throw new Error('Reference to mandatory DOM element not found');
	}

	if (i < 0) {
		throw new Error(`Invalid index value ${i}. Value must be >= 0`);
	}

	// first div in children, called offset-div is used to provide wheel offset during translation
	// and shouldn't be included
	const valuesChildren = Array.from(el.children).filter(
		curEl => curEl.classList.contains('offset-div') === false
	);

	return valuesChildren[i];
};

export const getWheelInfo = el => {
	// we must have reference to wheel DOM top element in order to calculate size of the single value inside of it
	if (el == null) {
		throw new Error('Reference to mandatory DOM element not found');
	}
	// first div in children, called offset-div is used to provide well offset during translation
	// and shouldn't be included in calculations
	const valuesChildren = Array.from(el.children).filter(
		curEl => curEl.classList.contains('offset-div') === false
	);
	// get container of each value and calculate accumulator of height
	const valuesElementsSize = valuesChildren.reduce((accumulator, curEl) => {
		const { height } = curEl.getBoundingClientRect();
		// use bounding client rect because it is more preciss the offsetHeight on IE
		return accumulator + height;
	}, 0);

	// calculate single element height
	const elementHeight = valuesElementsSize / valuesChildren.length;
	const startPosition = roundValueByStep(
		-valuesElementsSize / 2,
		elementHeight
	);

	return {
		translate: startPosition,
		elementHeight,
		selectedIndex: Math.round(valuesChildren.length / 2)
	};
};

export const getVisibleValues = (values, expandSize) =>
	sliceAroundMiddle(values, (expandSize + 1) * 2);
