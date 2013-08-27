function FourPoleLPFilter (sampleRate, cutoff, resonance, voltage) {
  console.log("SAMP")
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

function tanh(x){
  return 2.0 / (1.0 + Math.exp(-2.0 * x)) - 1.0;
}

FourPoleLPFilter.prototype = {
  resonance: 0.10,
  resonanceQuad: 0.0,
  cutoff: 20000.0,
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
    console.log("CUTOFF: ", this.cutoff);
    console.log("RES: ", this.resonance);
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
      for (var curStage = 0; curStage < 4; ++curStage) {
        // Stages 1, 2, 3
        if (curStage != 0) {
          this.input = this.stage[curStage-1];
          this.stageTANH[curStage - 1] = tanh(this.input * this.thermal); 
          this.stage[curStage] = this.stageZ1[curStage] + this.tune *
              this.stageTANH[curStage - 1] - 
              (curStage != 3 ? this.stageTANH[curStage] : tanh(this.stageZ1[curStage] * this.thermal));
        } 
        // New input, stage 0
        else {
          this.input = s - this.resonanceQuad * this.output;
          this.stage[curStage] = this.stageZ1[curStage] + this.tune *
              (tanh(this.input * this.thermal) - this.stageTANH[curStage]); 
        }
        this.stageZ1[curStage] = this.stage[curStage];
      }
      // .5 sample delay for phase compensation 
      // This can be realized by averaging two samples.
      local_output = (this.stage[3] + this.last_stage) * 0.5;
      this.last_stage = this.stage[3];
    }
    this.output = local_output;
    console.log(s, this.output);
    return this.output;
  },

  /**
   * Returns the current output sample of the controller.
   *
   * @return {Number} The current output sample of the controller.
   */
  getMix: function () {
    return this.output;
  },

  setParam: function (param, value) {
    switch (param) {
      case 'cutoff':
        this.setCutoff(value);
        break;
      case 'resonance':
        this.setResonance(value);
        break;
      case 'voltage':
        this.setTransistorVoltage(voltage);
        break;
    }
  }

};
