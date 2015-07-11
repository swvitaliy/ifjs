'use strict';

/**
 * Module dependencies
 */
var Interface = require('./Interface');
var _ = require('lodash');

function Class(F, P, interfaces, proto) {
  if (P) {
    F.prototype = new P();
    if (P.prototype && P.prototype[Interface.INTERFACES_PROP]) {
      F.prototype[Interface.INTERFACES_PROP] =
          P.prototype[Interface.INTERFACES_PROP].slice(0);
    }
    F.prototype.constructor = F;
  }
  _.extend(F.prototype, proto);
  Interface.ensureImplements(interfaces, F.prototype);
  return F;
}

module.exports = Class;
