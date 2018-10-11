import { sliceAroundMiddle } from '../../js/wheel/calc_func';

const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

test('slice array with 10 elements with no slice number provided', () => {
	const values = sliceAroundMiddle(testArray);

	expect(values).toEqual([]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('slice array with 10 elements around by 2', () => {
	const values = sliceAroundMiddle(testArray, 2);

	expect(values).toEqual([4, 5, 6, 7]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('slice array with 10 elements around by 4', () => {
	const values = sliceAroundMiddle(testArray, 4);

	expect(values).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('slice array with 10 elements around by 20', () => {
	const values = sliceAroundMiddle(testArray, 20);

	expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
