var BandLimitedOscillator = Source({
	name: 'BandLimitedOscillator',
	params: {
		phase: 0,
		frequency: 440,
		tables: null,
		tableSize: 4096,
		centsPerRange: 36,
		numberOfRanges: 1200 / 3
	}
})


BandLimitedOscillator.waveforms = {}

BandLimitedOscillator.waveforms.sine = function (real, imag) {
	DSP.add(real, 0)
	DSP.add(imag, 0)
	imag[1] = 1
}

BandLimitedOscillator.waveforms.square = function (real, imag) {
	DSP.add(real, 0)
	DSP.add(imag, 0)
	for (var n=1; n<imag.length; n+=2) {
		imag[n] = 1 / Math.PI / n
	}
}

BandLimitedOscillator.waveforms.sawtooth = function (real, imag) {
	DSP.add(real, 0)
	imag[0] = 0
	for (var n=1; n<imag.length; n++) {
		imag[n] = -(1 / Math.PI / n / 2) * Math.cos(Math.PI * n)
	}
}

BandLimitedOscillator.waveforms.triangle = function (real, imag) {
	real[0] = 0
	for (var n=0; n<real.length; n++) {
		real[n] = (4 - 4 * Math.cos(Math.PI * n)) /
			(n * n * Math.PI * Math.PI)
	}
	DSP.add(imag, 0)
}


BandLimitedOscillator.prototype.process = function (dst) {
	var frequencies = this.params.frequency
	var phases = this.params.phase

	this._calculateProduct(dst, phases, frequencies)
}

BandLimitedOscillator.prototype._calculateProduct = function (dst, phases, frequencies) {
	var tables = this.params.tables
	var tableSize = this.params.tableSize
	var centsPerRange = this.params.centsPerRange
	var numberOfRanges = this.params.numberOfRanges
	var readIndexMask = tableSize - 1
	var nyquist = this.sampleRate / 2
	var maxNumberOfPartials = tableSize * 2
	var lowestFundamentalFrequency = nyquist / maxNumberOfPartials

	for (var n=0; n<dst.length; n++) {
		var virtualReadIndex = phases[n] * tableSize
		var readIndex1 = ~~virtualReadIndex
		var readIndex2 = readIndex1 + 1
		readIndex1 &= readIndexMask
		readIndex2 &= readIndexMask

		var fundamentalFrequency = Math.abs(frequencies[n])
		var ratio = fundamentalFrequency > 0 ? fundamentalFrequency /
			lowestFundamentalFrequency : 0.5
		var centsAboveLowestFrequency = Math.log(ratio) /
			Math.LN2 * 1200
		var pitchRange = 1 + centsAboveLowestFrequency / centsPerRange
		pitchRange = Math.max(pitchRange, 0)
		pitchRange = Math.min(pitchRange, numberOfRanges - 1)

		var rangeIndex1 = ~~pitchRange
		var rangeIndex2 = rangeIndex1 < numberOfRanges - 1 ?
			rangeIndex1 + 1 : rangeIndex1
		var lowerWaveData = tables[rangeIndex2]
		var higherWaveData = tables[rangeIndex1]
		var tableInterpolationFactor = pitchRange - rangeIndex1

		var sample1Lower = lowerWaveData[readIndex1]
		var sample2Lower = lowerWaveData[readIndex2]
		var sample1Higher = higherWaveData[readIndex1]
		var sample2Higher = higherWaveData[readIndex2]

		var interpolationFactor = virtualReadIndex - readIndex1
		var sampleHigher = (1 - interpolationFactor) * sample1Higher +
			interpolationFactor * sample2Higher
		var sampleLower = (1 - interpolationFactor) * sample1Lower +
			interpolationFactor * sample2Lower

		dst[n] = (1 - tableInterpolationFactor) * sampleHigher +
			tableInterpolationFactor * sampleLower
	}
}

BandLimitedOscillator.prototype.setBasicWaveform = function (generator) {
	var real = new Float32Array(this.params.tableSize)
	var imag = new Float32Array(this.params.tableSize)

	if (typeof generator === 'string') {
		BandLimitedOscillator.waveforms[generator](real, imag)
	} else {
		generator(real, imag)
	}

	this.setSeries(real, imag)
}

BandLimitedOscillator.prototype.setSeries = function (real, imag) {
	var normalizationScale = 1
	var fftSize = this.params.tableSize
	var halfSize = fftSize / 2
	var tables = this.params.tables = []
	var numberOfRanges = this.params.numberOfRanges
	var centsPerRange = this.params.centsPerRange
	var fft = new FFT(fftSize)
	var realP = new Float32Array(fftSize)
	var imagP = new Float32Array(fftSize)
	var numberOfComponents = Math.min(real.length, imag.length)

	for (var rangeIndex=0; rangeIndex<numberOfRanges; rangeIndex++) {
		var scale = fftSize

		DSP.mul(realP, scale, real)
		DSP.mul(imagP, scale, imag)

		if (numberOfComponents < halfSize) {
			DSP.add(realP.subarray(numberOfComponents), 0)
			DSP.add(imagP.subarray(numberOfComponents), 0)
		}

		DSP.mul(imagP.subarray(0, halfSize), imagP.subarray(0, halfSize), -1)

		var centsToCull = rangeIndex * centsPerRange
		var cullingScale = Math.pow(2, -centsToCull / 1200)
		var numberOfPartials = cullingScale * halfSize

		if (numberOfPartials + 1 < halfSize) {
			DSP.add(realP.subarray(numberOfComponents + 1, halfSize), 0)
			DSP.add(imagP.subarray(numberOfComponents + 1, halfSize), 0)
		}

		if (numberOfPartials < halfSize) {
			imagP[0] = 0
		}

		realP[0] = 0
		var table = new Float32Array(fftSize)
		tables.push(table)

		fft.inverse(table, realP, imagP)

		if (!rangeIndex) {
			DSP.abs(realP, table)
			var maxValue = DSP.max(realP)

			if (maxValue) {
				normalizationScale = 1.0 / maxValue
			}
		}

		DSP.mul(table, table, normalizationScale)
	}
}