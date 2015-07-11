'use strict';

/**
 * Module dependencies
 */
var should = require('should');
var semver = require('semver');
var Interface = require('../lib/Interface');
var Class = require('../lib/Class');


describe('Interface', function() {

  it ('#ret ', function() {
    var B = new Interface('B', {
      hello: [String]
    });

    var A = new Interface('A', {
      getB: {args: [], result: B},
      getSelf: {args: [], result: A},
      id: {args: [Object], result: B}
    });

    var objB = Interface.ensureImplements([B], {
      hello: function(str) { return 'Hello, ' + str + '!'; }
    });

    var objA = Interface.ensureImplements([A], {
      getB: function() {
        return objB;
      },
      getSelf: function() {
        return objA;
      },
      id: function(obj) {
        return obj;
      }
    });

    objA.getB().should.be.equal(objB);
    objA.getB().hello('Dolly').should.be.equal('Hello, Dolly!');
    objA.getSelf().should.be.equal(objA);

    objA.id(objB).should.be.equal(objB);

    (function() {
      objA.id('test');
    }).should.be.throw();
  });

  it('#call check native types', function() {

    var A = new Interface('A', {
      str: [String],
      num: [Number],
      bool: [Boolean],
      re: [RegExp],
      date: [Date],
      func: [Function],
      arr: [Array],
      obj: [Object]
    });

    var obj1 = Interface.ensureImplements(A, {
      str: function(str) { return ['is string', str]; },
      num: function(num) { return ['is number', num]; },
      bool: function(bool) { return ['is boolean', bool]; },
      re: function(re) { return ['is regexp', re]; },
      date: function(date) { return ['is date', date]; },
      func: function(func) { return ['is func', func]; },
      arr: function(arr) { return ['is arr', arr]; },
      obj: function (obj) { return ['is obj', obj]; }
    });

     var obj2 = Interface.ensureImplements({

     }, {
      testStr: function(obj) {
        obj.str('test');
        obj.str(new String('test'));
      },
      testNoStrObj: function(obj) {
        obj.str({});
      },
      testNoStrArr: function(obj) {
        obj.str([]);
      },
      testNoStrNull: function(obj) {
        obj.str(null);
      },
      testNum0: function(obj) {
        obj.num(123);
        obj.num(new Number(123));
      },
      testNum1: function(obj) {
        obj.num(Number.MAX_VALUE);
        obj.num(new Number(Number.MAX_VALUE));
      },
      testNum2: function(obj) {
        obj.num(Number.NEGATIVE_INFINITY);
        obj.num(new Number(Number.NEGATIVE_INFINITY));
      },
      testBool: function(obj) {
        obj.bool(true);
        obj.bool(new Boolean(true));
      },
      testRe: function(obj) {
        obj.re(/.*/ig);
        obj.re(new RegExp('.*', 'ig'));
      },
      testDate: function(obj) {
        obj.date(new Date());
      },
      testFunc: function(obj) {
        obj.func(function() {});
        obj.func(new Function('x', 'return x'));
      },
      testArr: function(obj) {
        obj.arr([]);
        obj.arr(new Array);
      },
      testObj: function(obj) {
        obj.obj({});
        obj.obj(new Object);
      }
    });

    obj2.testStr(obj1);

    (function() {
      obj2.testNoStrObj(obj1);
    }).should.throw();

    (function() {
      obj2.testNoStrArr(obj1);
    }).should.throw();

    (function() {
      obj2.testNoStrNull(obj1);
    }).should.throw();

    obj2.testNum0(obj1);
    obj2.testNum1(obj1);
    obj2.testNum2(obj1);
    obj2.testBool(obj1);
    obj2.testRe(obj1);
    obj2.testDate(obj1);
    obj2.testFunc(obj1);
    obj2.testArr(obj1);
    obj2.testObj(obj1);

  });

  it('#call not in IF fn', function() {

    var A = new Interface('A', {
      add: [String],
      remove: [String],
      has: [String]
    });

    var obj1 = Interface.ensureImplements(A, {
      add: function(val) {
        return this.notInIf();
      },
      remove: function(val) {},
      has: function(val) {},
      notInIf: function() {
        return 'notInIf called!';
      }
    });

    var obj2 = Interface.ensureImplements({
      test0: [A],
      test1: [A]
    }, {
      test0: function(obj) {
        obj.notInIf();
      },
      test1: function(obj) {
        return obj.add('test');
      }
    });

    var errorMessage = semver.lt(process.version.substr(1), '0.11.0') ?
            "Object #<Object> has no method 'notInIf'" :
            "undefined is not a function";

    (function() {
      // function "notInIf" of object obj not found!
      obj2.test0(obj1);
    }).should.throw(errorMessage);

    obj2.test1(obj1).should.be.equal('notInIf called!');
  });


  it('#clear', function() {
    function F() {
      this.field = 'F';
    }

    F.prototype.fn = function() { return 'I\'m legal function';  };
    F.prototype.filth = function() {};

    var f = new F();
    var A = new Interface('A', {
      fn:[]
    });

    Interface.clear(A, f);

    /*console.log('f', f);
    console.log('f.__proto__', f.__proto__);*/

    (function() {
      f.filth();
    }).should.throw();

    f.fn().should.be.equal('I\'m legal function');

    function G() {
      F.call(this);
      this.gield = 'G';
    }

    G.prototype = new F();
    G.prototype.constructor = G;

    G.prototype.gg = function() { return 'I\'m a white rabbit!'; };
    F.prototype.gilth = function() {};

    var g = new G();

    var B = new Interface('B', {
      fn: [],
      gg: []
    });

    Interface.clear(B, g);

    g.gg().should.be.equal('I\'m a white rabbit!');
    g.fn().should.be.equal('I\'m legal function');
    (function() {
      g.filth();
    }).should.throw();
    (function() {
      g.gilth();
    }).should.throw();

    function H() {
      G.call(this);
      this.hield = 'H';
    }

    H.prototype = new G();
    H.prototype.constructor = H;

    H.prototype.hh = function() { return 'Who let the dogs out?!'; };
    H.prototype.hilth = function() {};

    var h = new H();


    var C = new Interface('B', {
      fn: [],
      gg: [],
      hh: []
    });

    Interface.clear(C, h);


    h.gg().should.be.equal('I\'m a white rabbit!');
    h.fn().should.be.equal('I\'m legal function');
    h.hh().should.be.equal('Who let the dogs out?!');

    (function() {
      h.filth();
    }).should.throw();
    (function() {
      h.gilth();
    }).should.throw();
    (function() {
      h.hilth();
    }).should.throw();

  });

  it('@__proto__', function() {
    function F() {

    }

    F.prototype.fn = function() { return 'I\'m called with ' +
        [].slice.call(arguments, 0).join() + '!';
    };

    F.prototype.hiddenFn = function() {
      return 'I\'m must be removed in client function!';
    };

    var IF = new Interface('IF', {
      fn: [String, String]
    });

    Interface.ensureImplements([IF], F.prototype);

    var A = new Interface('A' ,{
      testFn: [IF],
      testHiddenFn: [IF]
    });

    var objA = Interface.ensureImplements([A], {
      testFn: function(f) {
        f.fn('Hello', 'Dolly');
      },
      testHiddenFn: function(f) {
        f.hiddenFn();
      }
    });

    var f = new F();
    objA.testFn(f);
    (function() {
      objA.testHiddenFn(f);
    }).should.throw();
  });

  it('@null, undefined, ...', function() {
    var A = new Interface('A', {
      fn: []
    });

    var I = new Interface('I', {
      test: [A],
      test1: {args: [], result:A }
    });

    var a = Interface.ensureImplements([A], {
      fn: function() { return this; }
    });

    var obj = Interface.ensureImplements([I], {
      test: function(a) { return a.fn(); },
      test1: function(a) { return a; }
    });

    obj.test(a).should.be.equal(a);

    var errMsg = 'Called method "test" - argument #0 has invalid type';
    var errMsg1 = 'Called method "test1" - result not passed or has invalid type';
    var inputs = [null, undefined, false, true, 0, /.*/im, '', new Date(), function() {}, {}, []];
    inputs.forEach(function(val) {
      (function() {
        obj.test(val).should.be.equal(a);
      }).should.throw(errMsg);
    });

    inputs.forEach(function(val) {
      (function() {
        obj.test1(val).should.be.equal(a);
      }).should.throw(errMsg1);
    });

  });

  it('#extend', function() {
    var IA = new Interface('IA', {
      aFn:[]
    });

    var IB = new Interface('IB', {
      bFn:[]
    });

    IB.extend(IA);

    IB.methods.should.have.property('aFn', IA.methods.aFn);

    function B() {}

    Class(B, Object, [IB], {
      aFn: function() {},
      bFn: function() {}
    });

    var IClient = new Interface('IClient', {
      run:[IA]
    });

    function Client() {}

    Class(Client, Object, [IClient], {
      run: function(obj) {
        obj.fn();
      }
    });

    (function() {
      var client = new Client();
      client.run(new B);
    }).should.throw();

  });

});