import {
	nextTranslate,
	nextOffset,
	TRANSLATE_DIRECTIONS
} from '../../js/wheel/calc_func';

const prevTranslate = 100;
const elementHeight = 24;

test('Translate elements for 7 positions up', () => {
	const n = 7;
	expect(
		nextTranslate(prevTranslate, elementHeight, TRANSLATE_DIRECTIONS.UP, n)
	).toBe(268);

	expect(
		nextOffset(prevTranslate, elementHeight, TRANSLATE_DIRECTIONS.UP, n)
	).toBe(-68);
});

test('Translate elements for 3 positions down', () => {
	const n = 3;
	expect(
		nextTranslate(
			prevTranslate,
			elementHeight,
			TRANSLATE_DIRECTIONS.DOWN,
			n
		)
	).toBe(28);

	expect(
		nextOffset(prevTranslate, elementHeight, TRANSLATE_DIRECTIONS.DOWN, n)
	).toBe(172);
});

test('Translate elements for 15 positions down', () => {
	const n = 15;
	expect(
		nextTranslate(
			prevTranslate,
			elementHeight,
			TRANSLATE_DIRECTIONS.DOWN,
			n
		)
	).toBe(-260);

	expect(
		nextOffset(prevTranslate, elementHeight, TRANSLATE_DIRECTIONS.DOWN, n)
	).toBe(460);
});
