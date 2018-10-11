import { duplicateArrayValues } from '../../js/wheel/calc_func';

const testArray = [1, 2];

test('double the size of the array', () => {
	const values = duplicateArrayValues(testArray, 3);

	expect(values).toEqual([1, 2, 1, 2]);
	// original array is not changed
	expect(testArray).toEqual([1, 2]);
});

test('expand array 4 times', () => {
	// 4 is border value and will be included
	const values = duplicateArrayValues(testArray, 4);
	const expectedArray = [1, 2, 1, 2, 1, 2, 1, 2];

	expect(values).toEqual(expectedArray);
	// original array is not changed
	expect(testArray).toEqual([1, 2]);
});

test('double the size of the array and rotate it by 3 spots to the left', () => {
	const test = [1, 2, 3, 4];
	const values = duplicateArrayValues(test, 4, 3);

	expect(values).toEqual([4, 1, 2, 3, 4, 1, 2, 3]);
	// original array is not changed
	expect(test).toEqual([1, 2, 3, 4]);
});
