'use strict';

/**
 * Module dependencies
 */
var should = require('should');
var Interface = require('../lib/Interface');
var Class = require('../lib/Class');


describe('Class', function() {

  it('A implements IA, B extends A', function() {
    var IA = new Interface('IA', {
      aFn:[]
    });

    function A() {}

    Class(A, Object, [IA], {
      aFn: function() {}
    });

    var IB = new Interface('IB', {
      bFn:[]
    });

    function B() {}

    Class(B, A, [IB], {
      bFn:function() {}
    });

    var IClient = new Interface('IClient', {
      run:[IA]
    });

    function Client() {}

    Class(Client, Object, [IClient], {
      run: function(a) {
        a.aFn();
      }
    });

    var client = new Client();
    var b = new B;
    client.run(b);

  });

});