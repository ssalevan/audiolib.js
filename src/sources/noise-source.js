var NoiseSource = Source({
	name: 'NoiseSource',
	params: {
		color: 'white'
	}
})

NoiseSource.on('construct', function (self) {
	self.setColor(self.params.color)
})


NoiseSource.colors = {}

NoiseSource.colors.white = function () {}

NoiseSource.colors.brown = function (dst, filter, sampleRate) {
	filter.a[0] = Math.exp(-200 * Math.PI / sampleRate)
	filter.b[0] = 1 - filter.a[0]
	filter.filter(dst, dst)
	DSP.mul(dst, dst, 6.2)
}

NoiseSource.colors.pink = function (dst, filter) {
	filter.filter(dst, dst)
	DSP.mul(dst, dst, 0.55)
}


NoiseSource.prototype.process = function (dst) {
	var color = this.params.color
	var filter = this._temp.filter
	var sampleRate = this.sampleRate

	DSP.random(dst, -1, 1)
	NoiseSource.colors[color](dst, filter, sampleRate)
}

NoiseSource.prototype.setColor = function (color) {
	var filter = null

	switch (color) {
	case 'white':
		break
	case 'brown':
		filter = new Filter(1, 1)
		break
	case 'pink':
		filter = new Filter(6, 6)
		filter.a.set([0.997, 0.985, 0.950, 0.850, 0.620, 0.250])
		filter.b.set([
			0.029591,
			0.032534,
			0.048056,
			0.090579,
			0.108990,
			0.255784
		])
		break
	default:
		throw TypeError('Not implemented')
	}

	this._temp.filter = filter
	this.params.color = color
}
