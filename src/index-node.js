var AudioKit = this
var DSP = require('dsp').DSP
var Filter = require('dsp').Filter
var FFT = require('dsp').FFT

``
include('infra/extend')
include('infra/event-emitter')
include('infra/source')
include('sources/oscillation-source')
include('sources/noise-source')
include('sources/simple-oscillator')
include('sources/band-limited-oscillator')
``
