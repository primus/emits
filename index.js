'use strict';

/**
 * Returns a function that when invoked executes all the listeners of the
 * given event with the given arguments.
 *
 * @returns {Function} The function that emits all the things.
 * @api public
 */
module.exports = function emits() {
  var self = this
    , parser;

  for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
    args[i] = arguments[i];
  }

  //
  // Assume that if the last given argument is a function, it would be
  // a parser.
  //
  if ('function' === typeof args[args.length - 1]) {
    parser = args.pop();
  }

  return function emitter() {
    for (var i = 0, l = arguments.length, arg = new Array(l); i < l; i++) {
      arg[i] = arguments[i];
    }

    function next(err, returned) {
      if (err) return self.emit('error', err);

      if (returned === parser) return false;
      if (returned === null) arg = [];
      else if (returned !== undefined) arg = returned;

      return self.emit.apply(self, args.concat(arg));
    }

    if (parser) {
      //
      // If we accept more arguments on the parser then the supplied arguments
      // we want to assume that the parser needs to be executed asynchronously as
      // the extra argument would be a callback.
      //
      if (parser.length > arg.length) {
        return parser.apply(self, arg.concat(next)), true;
      } else {
        return next(undefined, parser.apply(self, arg));
      }
    }

    return self.emit.apply(self, args.concat(arg));
  };
};
