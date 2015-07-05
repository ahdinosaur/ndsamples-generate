var test = require('tape')
var through = require('through2')
var range = require('lodash.range')
var almostEqual = require('almost-equal')

var generator = require('./')

test('generate sin wave', function (t) {
  var chunkLength = 10
  var rate = 100
  var freq = 1

  function sin (x) {
    return function (t) {
//      console.log(t, Math.sin(2 * Math.PI * t * x))
      return Math.sin(2 * Math.PI * t * x)
    }
  }

  var expecteds = range(100)
    .map(function (x) { return x / rate })
    .map(sin(freq))

  var chunkNum = 0
  generator({
    shape: [1, chunkLength],
    fn: sin(freq),
    rate: rate
  })
  .pipe(through.obj(function (samples, enc, cb) {
    for (var i = 0; i < samples.data.length; i++) {
      var actual = samples.data[i]
      var expected = expecteds[chunkNum * chunkLength + i]
      t.ok(almostEqual(actual, expected, almostEqual.FLT_EPSILON))
    }
    t.equal(samples.data.length, chunkLength)
    if (chunkNum >= 9) {
      t.end()
    } else {
      chunkNum++
      cb()
    }
  }))
})
