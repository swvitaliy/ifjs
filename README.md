# ifjs
Native implementation of interfaces for js

[![npm](http://img.shields.io/npm/v/ifjs.svg)](https://www.npmjs.org/package/ifjs)



[Simple Example](examples/simple.js)

To describe the parameters or return values so you can use native js types (except null and undefined).

```javacript
var ICalc = new Interface('ICalc', { sum: {args: [Number, Number], result: Number},
        dif: {args: [Number, Number], result: Number} });

var IStringConcat = new Interface('IStringConcat', { concat: {args: [String, String], result: String} });

var IMatch = new Interface('IMatch', { match: {args: [RegExp], result: Boolean} });
```

In addition, in the description of the arguments to a function in the interface (or return values) can be used
a constructor function, for example:

```javacript
function F() {}
F.prototype.fn = function() { return '\' nruter } ()noitcnuf = nf.epytotorp.F'; }

var IFClient = new Interface('IFClient', {
  run: [F]
});

function FClient() {}

Class(FClient, null, [IFClient], {
  run: function(obj) {
    console.log(obj.fn());
  };
});

var f = new F();
var fclient = new FClient();

fclient.run(f);
```

can pass as an interface object, not wrapped `new Interface(...)`

```javacript
Class({}, null, [{ fn: [] }], { fn: function() { return 'Yes, we can!'; } });
```

If you pass only one interface, you can omit the brackets "[...]".

```javacript
Class({}, null, { fn: { args: [], result: String } },
    { fn: function() { return '1234567890'; } });
```

More examples are in [Russian localization](README_ru.md).


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/swvitaliy/ifjs/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

