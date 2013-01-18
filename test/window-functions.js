/* Window function references borrowed from DSP.js */
var functions = [function (length, index) {
  return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2))
}, function (length, index) {
  return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos((Math.PI * 2) * index / (length - 1))
}, function (length, index, alpha) {
  var a0 = (1 - alpha) / 2
  var a1 = 0.5
  var a2 = alpha / 2
  return a0 - a1 * Math.cos((Math.PI * 2) * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1))
}, function (length, index) {
  var x = Math.PI * index / (length - 1) - Math.PI / 2
  return Math.cos(x)
}, function (length, index, alpha) {
  return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2))
}, function (length, index) {
  return 0.54 - 0.46 * Math.cos((Math.PI * 2) * index / (length - 1))
}, function (length, index) {
  return 0.5 * (1 - Math.cos((Math.PI * 2) * index / (length - 1)))
}, function (length, index) {
  var x = 2 * index / (length - 1) - 1
  return Math.sin(Math.PI * x) / (Math.PI * x)
}, function (length, index) {
  return 1
}, function (length, index) {
  return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2))
}]

var names = [
  'Bartlett',
  'BartlettHann',
  'Blackman',
  'Cosine',
  'Gauss',
  'Hamming',
  'Hann',
  'Lanczos',
  'Rectangular',
  'Triangular'
]

require('../build-essentials/testing')
var wf = AudioKit.tools.windowFunctions

describe('Window functions', function () { for (var index=0, fn, name; (fn = functions[index]) && (name = names[index]); index++) { void function (fn, name) {
  describe(name, function () {
    it('should provide correct results', function () {
      var array = F(64)
      var alpha = Math.random() * 200 - 100
      wf[name](array, alpha)

      for (var i=0; i<array.length; i++) {
        assert_approx(array[i], F([fn(array.length, i, alpha)])[0])
      }
    })
  })
}(fn, name)}})
