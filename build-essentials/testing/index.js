var i = require('util').inspect
var config = require('../../package.json')
global.AudioKit = require('../../release/node')

var epsilon = 0.01

global.numericalCompare = function (x, y, e) {
	if (x === y || (isNaN(x) && isNaN(y))) return true

	return Math.abs((x - y) / x) < (e || epsilon)
}

global.F = function (d) {
	return new Float32Array(d)
}

global.assert = function (assertion, desc) {
	if (!assertion) throw Error(desc || 'Assertion failed')
}

global.assert_approx = function (a, b, desc) {
	assert(numericalCompare(a, b),
		desc || ('expected ' + i(a) + ' to be approximately ' + i(b))
	)
}

global.assert_identical = function (a, b, desc) {
	var obj = this.obj

	desc = desc || 'expected ' + i([].slice.call(a)) + ' to be identical to ' + i([].slice.call(b))

	assert(val.length === obj.length, desc)

	for (var n=0; n<val.length; n++) {
		assert_approx(val[n], obj[n], desc)
	}
}
