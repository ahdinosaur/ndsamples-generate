var inherits = require('inherits')
var Readable = require('readable-stream').Readable
var defined = require('defined')
var slice = require('lodash.slice')
var zeros = require('zeros')
var fill = require('ndarray-fill')

module.exports = SampleGenerator

inherits(SampleGenerator, Readable)
function SampleGenerator (opts) {
  if (!(this instanceof SampleGenerator)) {
    return new SampleGenerator(opts)
  }

  Readable.call(this, {
    objectMode: true
  })

  this.dtype = defined(opts.dtype, 'float32')
  this.shape = defined(opts.shape, [1, 1024]) 
  this.rate = defined(opts.rate, 44100)
  this.fn = defined(opts.fn, function (t) { return 0 })

  this.t = 0
  this.dt = 1 / this.rate
}

SampleGenerator.prototype._read = read
SampleGenerator.prototype._readSamples = readSamples

function read () {
  this.push(this._readSamples())
}

function readSamples () {
  var samples = zeros(this.shape, this.dtype)
  var fn = this.fn
  var t = this.t
  var dt = this.dt

  fill(samples, function () {
    var path = slice(arguments)
    var sample = fn.apply(null, [t].concat(path))
    t += dt
    return sample
  })

  this.t = t

  return samples
}
