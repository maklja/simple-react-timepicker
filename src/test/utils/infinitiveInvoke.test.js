import { infinitiveInvoke } from '../../js/utils/helper';

// invoke interval between calls
const invokeInterval = 200; // ms
const mockArgs = 'test';

test('callback is invoked with passed arguments', () => {
	const mockCallback = jest.fn();

	const cancelInvoke = infinitiveInvoke(
		mockCallback,
		mockArgs,
		invokeInterval
	);

	expect(typeof cancelInvoke).toBe('function');

	cancelInvoke();
	// callback must be invoked atleast once before cancel
	expect(mockCallback.mock.calls.length).toBe(1);
	// pass args must be equal with mockArgs
	expect(mockCallback).lastCalledWith(mockArgs);
});

test('callback is invoked 3 times before it is canceled', done => {
	// check if mock is invoked with expected args
	const mockCallback = jest.fn(arg => expect(arg).toBe(mockArgs));

	const cancelInvoke = infinitiveInvoke(
		mockCallback,
		mockArgs,
		invokeInterval
	);

	setTimeout(() => {
		// cancel invoke
		cancelInvoke();
		// because we invoke callback every 200ms
		// callback must be invoked atleast 3 times
		expect(mockCallback.mock.calls.length).toBeGreaterThanOrEqual(3);
		done();
	}, 700);
});
