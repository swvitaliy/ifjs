'use strict';

// Copied from https://gist.github.com/addyosmani/1057989

/**
 Code copyright Dustin Diaz and Ross Harmes, Pro JavaScript Design Patterns.
 **/

// Constructor.
var Interface = function(name, methods) {
  if (arguments.length !== 2) {
    throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
  }
  this.name = name;
  this.methods = {};
  for (var i in methods) {
    if (methods.hasOwnProperty(i)) {
      if (typeof i !== 'string' || typeof methods[i] !== 'object') {
        throw new Error("Interface constructor expects method to be " +
            "passed in as a key value pairs.");
      }

      if (methods[i].constructor.toString().substr(9, 7) === 'Array()') {
        methods[i] = { args: methods[i], result: undefined };
      }

      this.methods[i] = methods[i];
    }
  }
};

Interface.prototype.extend = function() {
  [].slice.call(arguments, 0).forEach(function(intf) {
    _copy(this.methods, intf.methods);
  }, this);
};

Interface.HARDROCK = true;
Interface.INTERFACES_PROP = '__intf_interfaces__';
Interface.FN_STORE_PROP = '__intf_fn_store__';
Interface.ORIGIN_PROTO_PROP = '__intf_origin_proto__';

var _intfIndex = 0;
var _toStr =  Object.prototype.toString;
var _hasOwnProp = Object.prototype.hasOwnProperty;

function _hasNativeType(T, val) {
  return T === String && _toStr.call(val) === '[object String]' ||
      T === Number && _toStr.call(val) === '[object Number]' ||
      T === Boolean && _toStr.call(val) === '[object Boolean]';
}

function _hasIntf(I, val) {
  return I instanceof Interface && val && val[Interface.INTERFACES_PROP] &&
      val[Interface.INTERFACES_PROP].indexOf(I) >= 0;
}

// Static class method.
Interface.ensureImplements = function(intfs, object) {
  if (Interface.HARDROCK && typeof object[Interface.INTERFACES_PROP] === 'undefined') {
    object[Interface.INTERFACES_PROP] = [];
  }

  if (intfs.constructor.toString().substr(9, 7) !== 'Array()') {
    intfs = [intfs];
  }

  for (var i = 0, len = intfs.length; i < len; i++) {
    var intf = intfs[i];
    if (intf.constructor !== Interface) {
      intf = new Interface('__' + _intfIndex, intf);
    }
    for (var method in intf.methods) {
      if (_hasOwnProp.call(intf.methods, method)) {
        if (!object[method] || typeof object[method] !== 'function') {
          throw new Error("object doesn't implement the " + intf.name +
              " interface. Method " + method + " was not found.");
        }

        if (Interface.HARDROCK) {
          object[method] = (function(method, argumentTypes, resultType, fn) {
              return function() {
                var argumentType, callArg, callArguments = [].slice.call(arguments, 0);
                for (var i = 0; i < argumentTypes.length; i += 1) {
                  argumentType = argumentTypes[i];
                  if (callArguments.length <= i) {
                      throw new Error("Called method \"" + method + "\" - argument #" + i + " not passed");
                  }

                  callArg = callArguments[i];
                  if (_hasNativeType(argumentType, callArg) || typeof argumentType === 'function' &&
                      callArg instanceof argumentType) {} else {
                    if (_hasIntf(argumentType, callArg)) {} else {
                      throw new Error("Called method \"" + method + "\" - argument #" + i + " has invalid type");
                    }

                    Interface.clear(argumentType, callArg);
                  }
                }

                // перед вызовом функции восстанавливаем все функции, не относящиеся к интерфейсу,
                // чтобы внутри вызываемой функции был полноценный объект
                if (this[Interface.FN_STORE_PROP]) {
                  Interface.restore(this);
                }

                var ret = fn.apply(this, callArguments);

                if (resultType) {
                  if (_hasNativeType(resultType, ret) || typeof resultType === 'function' &&
                      ret instanceof resultType) {} else {
                    if (_hasIntf(resultType, ret)) {} else {
                      throw new Error("Called method \"" + method + "\" - result not passed or has invalid type");
                    }

                    Interface.clear(resultType, ret);
                  }
                }

                // теперь снова удаляем все функции не относящиеся к интерфейсам, чтобы на клиенте
                // нельзя было их использовать
                if (this[Interface.FN_STORE_PROP]) {
                  _clearAgain(this);
                }

                for (i = 0; i < callArguments.length; i += 1) {
                  Interface.restore(callArguments[i]);
                }

                return ret;
              };
            })(method, intf.methods[method].args, intf.methods[method].result, object[method]);
        }
      }
    }

    if (Interface.HARDROCK) {
      object[Interface.INTERFACES_PROP].push(intf);
    }
  }

  return object;
};


Interface.clear = function (iface, obj) {
  if (!obj[Interface.FN_STORE_PROP]) {
    obj[Interface.FN_STORE_PROP] = {};
  }

  for (var i in obj) {
    if (_hasOwnProp.call(obj, i)) {
      if (typeof obj[i] === 'function' && !(i in iface.methods)) {
        if (!obj[Interface.FN_STORE_PROP][i]) {
          obj[Interface.FN_STORE_PROP][i] = obj[i];
        }
        delete obj[i];
      }
    }
  }

  if (obj.__proto__ && obj.__proto__.__proto__) {
    var proto = _copy(obj.__proto__);

    /*var obj = {};
    obj.__proto__ = obj.__proto__.__proto__;
    obj.__proto__ === null;
    // А там, между прочим, находится очень полезная функция hasOwnProperty и другие.
    // Кроме того, "should" расширяет именно этот объект.
    */

    proto.__proto__ = obj.__proto__.__proto__;
    obj[Interface.ORIGIN_PROTO_PROP] = obj.__proto__;
    obj.__proto__ = proto;
    Interface.clear(iface, proto);
  }
};

function _copy(ret, obj) {
  // object with "__proto__" property
  // ret.__proto__ === Object.prototype
  // ret.__proto__.constructor === Object
  // Object.prototype.__proto__ === null

  if (typeof obj === 'undefined') {
    obj = ret;
    ret = {};
  }

  for (var i in obj) {
    if (_hasOwnProp.call(obj, i)) {
      ret[i] = obj[i];
    }
  }
  return ret;
}

function _clearAgain(obj) {
  for (var i in obj[Interface.FN_STORE_PROP]) {
    if (_hasOwnProp.call(obj[Interface.FN_STORE_PROP], i)) {
      delete obj[i];
    }
  }
}

Interface.restore = function (obj) {
  if (!obj[Interface.FN_STORE_PROP]) {
    return ;
  }
  for (var i in obj[Interface.FN_STORE_PROP]) {
    if (_hasOwnProp.call(obj[Interface.FN_STORE_PROP], i)) {
      obj[i] = obj[Interface.FN_STORE_PROP][i];
    }
  }

  if (obj[Interface.ORIGIN_PROTO_PROP]) {
    obj.__proto__ = obj[Interface.ORIGIN_PROTO_PROP];
    delete obj[Interface.ORIGIN_PROTO_PROP];
  }
};

module.exports = Interface;

