/**
 *  class RemoveProcessingDirectives
 *
 *  By default processing directives (comments starting with //=) are kept in the resulting file.
 *  This processor removes them.
 *
 *  This behavior can be disabled with:
 *
 *      environment.unregisterPostProcessor('application/javascript', RemoveProcessingDirectives);
 *
 *  ##### SUBCLASS OF
 *
 *  [[Template]]
 **/


'use strict';

// internal
var Template = require('mincer').Template;


////////////////////////////////////////////////////////////////////////////////


// Class constructor
var RemoveProcessingDirectives = module.exports = function RemoveProcessingDirectives() {
  Template.apply(this, arguments);
};

require('util').inherits(RemoveProcessingDirectives, Template);

/*jshint unused:false*/

// Process data
RemoveProcessingDirectives.prototype.evaluate = function (context, locals) {
  return this.data
    .split('\n')
    .filter(function(line) {
      return !line.startsWith('//(=)');
    })
    .join('\n');
};
