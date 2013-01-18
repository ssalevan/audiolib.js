function Source (opts) {
	if (!opts) return

	var k
	var body = 'return function ' + opts.name + ' (opts) {'
	body += 'if (!(this instanceof ' + opts.name + ')) return new ' + opts.name + '(opts);'
	body += 'if (!opts) opts = {};'
	body += 'Object.defineProperty(this, "_temp", { value: {}, writable: true, configurable: true });'
	body += 'Object.defineProperty(this, "params", { value: {}, writable: true, configurable: true });'
	body += 'extend(this, Source.defaults);'
	body += 'if (typeof opts.sampleRate === "number") this.sampleRate = opts.sampleRate;'
	body += 'var sampleRate = this.sampleRate;'
	body += 'if (typeof opts.blockSize === "number") this.blockSize = opts.blockSize;'
	body += 'var blockSize = this.blockSize;'

	if (opts.tempBuffers) {
		for (k in opts.tempBuffers) {
			if (!hasOwn(opts.tempBuffers, k)) continue

			body += 'this._temp[' + JSON.stringify(k) + '] = new Float32Array(' + opts.tempBuffers[k] + ');'
		}
	}

	body += 'extend(this.params, ' + opts.name + '.defaults, opts.params);'
	body += 'this.initEvents();'
	body += opts.name + '.emit("construct", [this, opts]);'
	body += '}'

	var fn = Function('Source', 'extend', body)(Source, extend)

	fn.defaults = opts.params
	fn.prototype = new Source()
	fn.prototype.constructor = fn
	fn.prototype.type = opts.name

	AudioKit.sources[opts.name] = fn

	return EventEmitter.create(fn)
}

Source.defaults = {
	sampleRate: 48000,
	blockSize: 4096
}

Source.prototype = EventEmitter()

Source.prototype.constructor = Source

AudioKit.Source = Source
AudioKit.sources = Object.create(null)
