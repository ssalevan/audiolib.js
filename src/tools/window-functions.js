var windowFunctions = Object.create(null)
AudioKit.tools = AudioKit.tools || Object.create(null)
AudioKit.tools.windowFunctions = windowFunctions

windowFunctions.Bartlett = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.sub(dst, dst, max / 2)
	DSP.abs(dst, dst)
	DSP.sub(dst, max / 2, dst)
	DSP.mul(dst, dst, 2 / max)
}

windowFunctions.BartlettHann = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.div(dst, dst, max)
	var tmp = new Float32Array(dst)
	DSP.mul(dst, 2 * Math.PI, dst)
	DSP.cos(dst, dst)
	DSP.mul(dst, dst, 0.38)
	DSP.sub(tmp, tmp, 0.5)
	DSP.abs(tmp, tmp)
	DSP.mul(tmp, tmp, 0.48)
	DSP.sub(dst, 0.62, tmp, dst)
}

windowFunctions.Blackman = function (dst, alpha) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.div(dst, dst, max)
	var tmp = new Float32Array(dst)
	DSP.mul(dst, 2 * Math.PI, dst)
	DSP.cos(dst, dst)
	DSP.mul(dst, dst, -0.5)
	DSP.mul(tmp, 4 * Math.PI, tmp)
	DSP.cos(tmp, tmp)
	DSP.mul(tmp, tmp, alpha / 2)
	DSP.add(dst, (1 - alpha) / 2, dst, tmp)
}

windowFunctions.Cosine = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.mul(dst, dst, Math.PI / max)
	DSP.sub(dst, dst, Math.PI / 2)
	DSP.cos(dst, dst)
}

windowFunctions.Gauss = function (dst, alpha) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.sub(dst, dst, max / 2)
	DSP.div(dst, dst, alpha * max / 2)
	DSP.pow(dst, dst, 2)
	DSP.mul(dst, -0.5, dst)
	DSP.pow(dst, Math.E, dst)
}

windowFunctions.Hamming = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.mul(dst, dst, 2 * Math.PI / max)
	DSP.cos(dst, dst)
	DSP.mul(dst, dst, 0.46)
	DSP.sub(dst, 0.54, dst)
}

windowFunctions.Hann = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.mul(dst, dst, 2 * Math.PI / max)
	DSP.cos(dst, dst)
	DSP.sub(dst, 1.0, dst)
	DSP.mul(dst, dst, 0.5)
}

windowFunctions.Lanczos = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.mul(dst, dst, 2 / max)
	DSP.sub(dst, dst, 1)
	DSP.mul(dst, dst, Math.PI)
	var tmp = new Float32Array(dst)
	DSP.sin(dst, dst)
	DSP.div(dst, dst, tmp)
}

windowFunctions.Rectangular = function (dst) {
	DSP.add(dst, 1)
}

windowFunctions.Triangular = function (dst) {
	var max = dst.length - 1
	DSP.ramp(dst, 0, max)
	DSP.sub(dst, dst, max / 2)
	DSP.abs(dst, dst)
	DSP.sub(dst, dst.length / 2, dst)
	DSP.mul(dst, dst, 2 / dst.length)
}
