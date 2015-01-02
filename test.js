/* istanbul ignore next */
describe('emits', function () {
  'use strict';

  var EventEmitter = require('events').EventEmitter
    , assume = require('assume')
    , emits = require('./')
    , example;

  function Example() {
    EventEmitter.call(this);
  }

  require('util').inherits(Example, EventEmitter);
  Example.prototype.emits = emits;

  beforeEach(function () {
    example = new Example();
  });

  it('is exported as a function', function () {
    assume(emits).is.a('function');
  });

  it('has the context of the prototype', function (next) {
    var fn = example.emits('data');

    example.on('data', function () {
      assume(this).equals(example);

      next();
    });

    assume(fn()).is.true();
  });

  it('merges the arguments', function (next) {
    var fn = example.emits('data', 'foo');

    example.on('data', function (foo, bar) {
      assume(foo).equals('foo');
      assume(bar).equals('bar');

      next();
    });

    assume(fn('bar')).is.true();
  });

  it('returns false when there are no listeners', function () {
    var fn = example.emits('data');
    assume(fn()).is.false();
  });

  it('returns true when there are listeners', function () {
    var fn = example.emits('data');
    example.on('data', function () {});

    assume(fn()).is.true();
  });

  it('calls the parser function even when there are no listeners', function (next) {
    var fn = example.emits('data', function (done) {
      done();
      next();
    });

    assume(fn()).is.true();
  });

  it('does not emit the event if no data argument is supplied', function (next) {
    var fn = example.emits('data', function (done) {
      done();
      next();
    });

    example.on('data', function () {
      throw new Error('I should never be called');
    });

    assume(fn()).is.true();
  });

  it('returns only the supplied arguments when null is returned', function (next) {
    var fn = example.emits('data', 'bar', function (done) {
      done(undefined, null);
    });

    example.on('data', function (bar, foo) {
      assume(foo).equals(undefined);
      assume(bar).equals('bar');

      next();
    });

    assume(fn('foo')).is.true();
  });

  it('returns all received arguments when undefined is returned', function (next) {
    var fn = example.emits('data', 'sup', function (done) {
      done(undefined, undefined);
    });

    example.on('data', function (sup, foo, bar) {
      assume(arguments).has.length(3);
      assume(sup).equals('sup');
      assume(foo).equals('foo');
      assume(bar).equals('bar');

      next();
    });

    assume(fn('foo', 'bar')).is.true();
  });

  it('can modify the data', function (next) {
    var fn = example.emits('data', 'sup', function (done) {
      done(undefined, 'bar');
    });

    example.on('data', function (sup, foo) {
      assume(sup).equals('sup');
      assume(foo).equals('bar');

      next();
    });

    assume(fn('foo')).is.true();
  });

  it('supports async execution', function (next) {
    var fn = example.emits('data', 'sup', function (done) {
      setTimeout(function () {
        done(undefined, 'bar');
      }, 100);
    });

    example.on('data', function (sup, foo, bar) {
      assume(bar).equals(undefined);
      assume(sup).equals('sup');
      assume(foo).equals('bar');

      next();
    });

    assume(fn('foo')).is.true();
  });

  it('emits an error when async execution fails with an error', function (next) {
    var fn = example.emits('data', 'sup', function (done) {
      setTimeout(function () {
        done(new Error('lol failure'), 'bar');
      }, 100);
    });

    example.on('data', function () {
      throw new Error('I should never be called');
    });

    example.on('error', function (err) {
      assume(err.message).equals('lol failure');
      next();
    });

    assume(fn('foo')).is.true();
  });
});
