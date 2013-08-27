function FourPoleLPFilter (sampleRate, cutoff, resonance, voltage) {
  this.initializeFilter();
  this.sampleRate = isNaN(sampleRate) ? this.sampleRate : sampleRate;
  if (!isNaN(cutoff)) {
    this.setCutoff(cutoff);
  }
  if (!isNaN(resonance)) {
    this.setResonance(resonance);
  }
  if (!isNaN(voltage)) {
    this.setTransistorVoltage(voltage);
  }
}

function tanh (arg) {
  return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
}

FourPoleLPFilter.prototype = {
  resonance: 0.10,
  resonanceQuad: 0.0,
  cutoff: 1000.0,
  acr: 0.0,
  tune: 0.0,

  input: 0.0,
  output: 0.0,

  sampleRate: 44100.0,
  stage: [ 0.0, 0.0, 0.0, 0.0 ],
  stageZ1: [ 0.0, 0.0, 0.0, 0.0 ],
  stageTANH: [ 0.0, 0.0, 0.0 ],

  voltage: 1.22070313,
  thermal: (1.0 / 1.22070313),
  lastStage: 0,

  initializeFilter: function () {
    this.setCutoff(1000);
    this.setResonance(0.1);
  },

  setCutoff: function (cut) {
    this.cutoff = cut;

    // Normalized Cutoff
    var fc = this.cutoff / this.sampleRate;

    var x_2 = fc / 2;
    var x2 = fc * fc;
    var x3 = fc * x2;

    // Frequency & amplitude correction
    fcr = 1.8730 * x3 + 0.4955 * x2 - 0.6490 * fc + 0.9988;

    // Resonance compensation 
    this.acr = -3.9364 * x2 + 1.8409 * fc + 0.9968;

    // Normal scaled impulse invariant transformed one-pole filter; exp() models resonance
    // The coefficient g determines the cutoff frequency
    this.tune = (1.0 - Math.exp(-((2*Math.PI) * x_2 * fcr))) / this.thermal;
  },

  setResonance: function (res) {
    if (res < 0) {
      this.resonance = 0;
    }
    else {
      this.resonance = res;
    }
    // (Modified Huovilainen Fig 23)
    this.resonanceQuad = 4.0 * this.resonance * this.acr;
  },

  setTransistorVoltage: function (V) {
    // Base-emitter voltages of the transistors
    this.thermal = (1.0 / V);

    this.initializeFilter();
  },

  /**
   * Processes provided sample, moves the gain controller one sample forward in the sample time.
   *
   * @arg {Number} s The input sample for the gain controller.
   * @return {Number} The current output sample of the controller.
   */
  pushSample: function (s) {
    var local_output;

    for (var j = 0; j < 2; ++j) {
      // Filter stages (Huovilainen Fig 22)   
      for (var stage = 0; stage < 4; ++stage) {
        // Stages 1, 2, 3
        if (stage != 0) {
          this.input = this.stage[stage-1];
          this.stageTANH[stage - 1] = tanh(this.input * this.thermal); 
          this.stage[stage] = this.stageZ1[stage] + this.tune *
              this.stageTANH[stage - 1] - 
              (stage != 3 ? this.stageTANH[stage] : tanh(this.stageZ1[stage] * this.thermal));
        } 
        // New input, stage 0
        else {
          this.input = s - this.resonanceQuad * this.output;
          this.stage[stage] = this.stageZ1[stage] + this.tune *
              (tanh(this.input * this.thermal) - this.stageTANH[stage]); 
        }
        this.stageZ1[stage] = this.stage[stage];
      }
      // .5 sample delay for phase compensation 
      // This can be realized by averaging two samples.
      local_output = (this.stage[3] + this.last_stage) * 0.5;
      this.last_stage = this.stage[3];
    }
    this.output = local_output;
    return this.output;
  },

  /**
   * Returns the current output sample of the controller.
   *
   * @return {Number} The current output sample of the controller.
   */
  getMix: function () {
    return this.output;
  }

};
