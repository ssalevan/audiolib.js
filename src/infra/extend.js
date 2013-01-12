/*jshint asi:true */

/**
 * Extends an object with the own properties of other objects.
 *
 * @arg obj Object to assign properties to.
 * @arg ...objects Objects to extend with.
 *
 * @return The object passed as 'obj'.
*/
var hasOwn = Function.call.bind(Object.prototype.hasOwnProperty)
var extend = function (obj) {
	for (var i=1; i<arguments.length; i++) {
		if (!arguments[i]) continue

		for (var k in arguments[i]) {
			if (!hasOwn(arguments[i], k)) continue

			obj[k] = arguments[i][k]
		}
	}

	return obj
}
