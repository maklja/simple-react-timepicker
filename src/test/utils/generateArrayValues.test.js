import { generateArrayValues } from '../../js/utils/helper';

test('generate values from 1 to 5 with step 1', () => {
	const values = generateArrayValues(6, 1);

	expect(values).toEqual([0, 1, 2, 3, 4, 5]);
});

test('generate values from 1 to 5 with step 2', () => {
	const values = generateArrayValues(6, 2);

	expect(values).toEqual([0, 2, 4]);
});

test('generate values from 5 to 10 with step 1', () => {
	const values = generateArrayValues(11, 1, 5);

	expect(values).toEqual([5, 6, 7, 8, 9, 10]);
});

test('generate values from 5 to 10 with step 2', () => {
	const values = generateArrayValues(11, 2, 5);

	expect(values).toEqual([5, 7, 9]);
});
