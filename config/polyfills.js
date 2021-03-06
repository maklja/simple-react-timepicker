'use strict';

if (typeof Promise === 'undefined') {
	// Rejection tracking prevents a common issue where React gets into an
	// inconsistent state due to an error, but it gets swallowed by a Promise,
	// and the user has no idea what causes React's erratic future behavior.
	require('promise/lib/rejection-tracking').enable();
	window.Promise = require('promise/lib/es6-extensions.js');
}

// fetch() polyfill for making API calls.
require('whatwg-fetch');
require('core-js/modules/es7.object.values');
require('core-js/modules/es6.array.from');
require('core-js/modules/es6.array.find');
require('core-js/modules/es6.math.sign');
require('core-js/fn/symbol/iterator.js');
require('core-js/modules/es6.symbol');
require('core-js/modules/es7.array.includes');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
if (process.env.NODE_ENV === 'test') {
	require('raf').polyfill(global);
}
