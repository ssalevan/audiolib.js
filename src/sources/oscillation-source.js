var OscillationSource = Source({
	name: 'OscillationSource',
	tempBuffers: {
		lastPhase: '1'
	},
	params: {
		frequency: 440,
		detune: 0,
		phaseOffset: 0,
		pulseWidth: 0.5
	}
})

OscillationSource.prototype.process = function (phases, frequencies) {
	var offset = this.blockSize - Math.min(phases.length, frequencies.length)
	var frequency = this.params.frequency
	var detune = this.params.detune
	var phaseOffset = this.params.phaseOffset
	var pulseWidth = this.params.pulseWidth
	var lastPhase = this._temp.lastPhase

	if (offset) {
		frequency = frequency instanceof Float32Array ?
			frequency.subarray(offset) : frequency
		detune = detune instanceof Float32Array ?
			detune.subarray(offset) : detune
		phaseOffset = phaseOffset instanceof Float32Array ?
			phaseOffset.subarray(offset) : phaseOffset
		pulseWidth = pulseWidth instanceof Float32Array ?
			pulseWidth.subarray(offset) : pulseWidth
	}

	this._calculatePhases(phases, frequencies, frequency, detune, phaseOffset, this.sampleRate, lastPhase)
	DSP.fract(phases, phases)

	if (pulseWidth !== 0.5) {
		this._modulatePulseWidth(phases, phases, pulseWidth)
	}
}

OscillationSource.prototype._calculatePhases = function (phases, frequencies, frequency, detune, phaseOffset, sampleRate, lastPhase) {
	DSP.mul(frequencies, detune, 1.0 / 1200)
	DSP.pow(frequencies, 2, frequencies)
	DSP.add(frequencies, frequencies, 1)
	DSP.mul(frequencies, frequencies, frequency)

	var p = lastPhase[0] % 1
	DSP.add(phases, 1 / sampleRate / 2)
	DSP.mul(phases, phases, frequencies)

	for (var i=0; i<phases.length; i++) {
		phases[i] = p = p + phases[i]
	}

	lastPhase[0] = p
}

OscillationSource.prototype._modulatePulseWidth = function (dst, phases, pulseWidth) {
	/* FIXME: this gives weird results */
	var i

	if (pulseWidth instanceof Float32Array) {
		for (i=0; i<dst.length; i++) {
			dst[i] = phases[i] < pulseWidth[i] ?
				phases[i] / pulseWidth[i] :
				(phases[i] - pulseWidth[i]) /
				(1 - pulseWidth[i])
		}
	} else {
		for (i=0; i<dst.length; i++) {
			dst[i] = phases[i] < pulseWidth ?
				phases[i] / pulseWidth :
				(phases[i] - pulseWidth) /
				(1 - pulseWidth)
		}
	}
}
