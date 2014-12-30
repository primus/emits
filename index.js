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
    , length
    , parser;

  for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
    args[i] = arguments[i];
  }

  //
  // Assume that if the last given argument is a function, it would be
  // a parser.
  //
  if ('function' !== typeof args[args.length - 1]) return function emitter() {
    for (var i = 0, l = arguments.length, arg = new Array(l); i < l; i++) {
      arg[i] = arguments[i];
    }

    return self.emit.apply(self, args.concat(arg));
  };

  parser = args.pop();
  length = parser.length;

  /**
   * The actual function does the emitting of the given event. It will return
   * a boolean indicating if the event was emitted.
   *
   * @returns {Boolean}
   * @api public
   */
  return function emitter() {
    for (var i = 0, arg = new Array(length); i < length; i++) {
      arg[i] = arguments[i];
    }

    /**
     * Async completion method for the parser.
     *
     * @param {Error} err
     * @param {Mixed} returned
     * @api private
     */
    arg[length] = function next(err, returned) {
      if (err) return self.emit('error', err);

      if (arguments.length === 1) return false;
      if (returned === null) arg = [];
      else if (returned !== undefined) arg = returned;

      self.emit.apply(self, args.concat(arg.slice(0, length - 1)));
    };

    parser.apply(self, arg);
    return true;
  };
};
