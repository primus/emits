'use strict';

var slice = Array.prototype.slice;

/**
 * Return a function that emits the
 *
 * @returns {Function} The function that emits all the things.
 * @api public
 */
module.exports = function emits() {
  var args = slice.call(arguments, 0)
    , event = args[0]
    , self = this
    , parser;

  //
  // Assume that if the last given argument is a function, it would be
  // a parser.
  //
  if ('function' === typeof args[args.length - 1]) {
    parser = args.pop();
  }

  return function emit() {
    if (!self.listeners(event).length) return false;

    for (var i = 0, l = arguments.length, arg = new Array(l); i < l; i++) {
      arg[i] = arguments[i];
    }

    if (parser) {
      var returned = parser.apply(self, arg);

      if (returned === parser) return false;
      if (returned === null) arg = [];
      else if (returned !== undefined) arg = returned;
    }

    return self.emit.apply(self, args.concat(arg));
  };
};
