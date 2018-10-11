import { arrayRotate } from '../../js/wheel/calc_func';

const testArray = [1, 2, 3, 4, 5];

test('rotate array to left by 1 spot', () => {
	const values = arrayRotate(testArray);

	expect(values).toEqual([2, 3, 4, 5, 1]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5]);
});

test('rotate array to right by 1 spot', () => {
	const values = arrayRotate(testArray, true);

	expect(values).toEqual([5, 1, 2, 3, 4]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5]);
});

test('rotate array to left by 3 spot', () => {
	const values = arrayRotate(testArray, false, 3);

	expect(values).toEqual([4, 5, 1, 2, 3]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5]);
});

test('rotate array to right by 3 spot', () => {
	const values = arrayRotate(testArray, true, 3);

	expect(values).toEqual([3, 4, 5, 1, 2]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5]);
});

test('rotate array with negative value', () => {
	const values = arrayRotate(testArray, false, -3);

	expect(values).toEqual([1, 2, 3, 4, 5]);
	// original array is not changed
	expect(testArray).toEqual([1, 2, 3, 4, 5]);
});
