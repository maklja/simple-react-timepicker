import { windowAvailableSpace } from '../../js/wheel/calc_func';

describe('Check free space in parent where parent height is 800px, element height is 25px, number of elements is 9', () => {
	const elementHeight = 25;
	const parentBoundingBox = {
		height: 800
	};
	const padding = 0;
	const n = 9;

	test('bounding box position is { top: 30, bottom: 120 }', () => {
		const boundingBox = {
			top: 30,
			bottom: 120
		};

		expect(
			windowAvailableSpace(
				elementHeight,
				n,
				boundingBox,
				parentBoundingBox,
				padding
			)
		).toEqual({
			maxSpaceTop: 1,
			maxSpaceBottom: 9,
			offsetTop: 25,
			offsetBottom: 0
		});
	});

	test('bounding box position is { top: 220, bottom: 320 }', () => {
		const boundingBox = {
			top: 220,
			bottom: 320
		};

		expect(
			windowAvailableSpace(
				elementHeight,
				n,
				boundingBox,
				parentBoundingBox,
				padding
			)
		).toEqual({
			maxSpaceTop: 8,
			maxSpaceBottom: 9,
			offsetTop: 200,
			offsetBottom: 0
		});
	});

	test('bounding box position is { top: 640, bottom: 760 }', () => {
		const boundingBox = {
			top: 640,
			bottom: 760
		};

		expect(
			windowAvailableSpace(
				elementHeight,
				n,
				boundingBox,
				parentBoundingBox,
				padding
			)
		).toEqual({
			maxSpaceTop: 9,
			maxSpaceBottom: 1,
			offsetTop: 225,
			offsetBottom: -200
		});
	});
});

describe('Check free space in parent where parent height is 300px, element height is 25px, number of elements is 10', () => {
	const elementHeight = 25;
	const parentBoundingBox = {
		height: 300
	};
	const padding = 0;
	const n = 10;

	test('bounding box position is { top: 30, bottom: 120 }', () => {
		const boundingBox = {
			top: 30,
			bottom: 120
		};

		expect(
			windowAvailableSpace(
				elementHeight,
				n,
				boundingBox,
				parentBoundingBox,
				padding
			)
		).toEqual({
			maxSpaceTop: 1,
			maxSpaceBottom: 7,
			offsetTop: 25,
			offsetBottom: -75
		});
	});

	test('bounding box position is { top: 200, bottom: 300 }', () => {
		const boundingBox = {
			top: 200,
			bottom: 300
		};

		expect(
			windowAvailableSpace(
				elementHeight,
				n,
				boundingBox,
				parentBoundingBox,
				padding
			)
		).toEqual({
			maxSpaceTop: 8,
			maxSpaceBottom: 0,
			offsetTop: 200,
			offsetBottom: -250
		});
	});

	test('bounding box position is { top: 100, bottom: 200 }', () => {
		const boundingBox = {
			top: 100,
			bottom: 200
		};

		expect(
			windowAvailableSpace(
				elementHeight,
				n,
				boundingBox,
				parentBoundingBox,
				padding
			)
		).toEqual({
			maxSpaceTop: 4,
			maxSpaceBottom: 4,
			offsetTop: 100,
			offsetBottom: -150
		});
	});
});
