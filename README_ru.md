#cl-intf

## Цели проекта

* Поддержка интерфейсов.
* Поддержка приватных областей видимости, причем произвольных, не только private и protected.


## Проверка програмных интерфейсов при разработке

Модуль содержит 2 функции, служащих для этого:
* Interface - функция-конструктор, создающая интерфейс доступа к вашему объекту.
* Class - простая обертка для описания функции-конструктора, включающая
  наследование через F.prototype = new Parent(),
  список интерфейсов и объект-прототип.

Проверка объекта на принадлежность интерфейсу происходит в 2-х случаях:
* на этапе определения класса с помощью функции Class
* на этапе передачи объекта как параметра в функцию, которая описана в интерфейсе.

[Простой пример](examples/simple.js)

Для описания параметров или возвращаемого значения так можно использовать нативные js типы (кроме null и undefined).

```javacript
var ICalc = new Interface('ICalc', { sum: {args: [Number, Number], result: Number},
        dif: {args: [Number, Number], result: Number} });

var IStringConcat = new Interface('IStringConcat', { concat: {args: [String, String], result: String} });

var IMatch = new Interface('IMatch', { match: {args: [RegExp], result: Boolean} });
```

Кроме этого, при описании аргументов функции в интерфейсе (или возвращаемых функцией значений) можно использовать
функцию-конструктор, например:

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


Вы можете передавать в качестве интерфейса объект, не обрамленный в new Interface([ifname], ...).

```javacript
Class({}, null, [{ fn: [] }], { fn: function() { return 'Yes, we can!'; } });
```

Если вы передаете только один интерфейс можно опустить скобки "[...]".

```javacript
Class({}, null, { fn: { args: [], result: String } },
    { fn: function() { return '1234567890'; } });
```

Однако, в случае, если вы не обрамляете интерфейс в new Interface([ifname], ...) самостоятельно, происходит его
обрамление в данную конструкцию автоматически и имя интерфейса задается также автоматически. Это имя является просто
инкрементным числом, поэтому при ошибке вы получите что-то вроде

    object doesn't implement the "\_\_12" interface. Method "fn" was not found.

Какой именно это интерфейс остается неясным. Поэтому я бы рекомендовал самостоятельно создавать объекты-интефрейсы.

Чистота.
--------

Одной из особенностей интерфейса является его "чистота". Если вы передаете в функцию некоторый объект по интерфейсу
(здесь необходимо передавать именно по интерфейсу, те. объекту созданному как new Interface), то все поля-функции
передаваемого объекта, которые не соответствуют интерфейсу, внутри функции будут недоступны. Причем при выходе из нее
они снова становятся доступными. Также происходит проверка всех "\_\_proto\_\_" свойств у объекта и "очистка" функций
из них, что позволяет использовать "наследование" по prototype / \_\_proto\_\_.

Таким образом, внутри "клиента" вы можете использовать только то, что позволяет вам использовать интерфейс.

Указанная фича не касается полей данных, только функций.
Те. мы можем иметь доступ к неуказанным в интерфейсе полям данных (а их там и нельзя указать).
Этот недостаток я надеюсь в будущем исправить.

Пример с вызовом функции, которая не указана в интерфейсе

```javacript
var IPush = new Interface('IPush', { push: [String] });
var IPop = new Interface('IPop', { pop: { args:[], result:String } });

function Stack() {
  this.items = [];
}

Class(Stack, null, [IPush, IPop], {
  push: function(str) { this.items.push(str); return this; },
  pop: function() {
    if (!this.items.length) throw "empty stack";
    return this.items.pop();
  }
});

var IPusher = new Interface('IPusher', { run: [IPush] });

function Pusher() {}

Class(Pusher, null, [IPusher], {
  run: function(stack) {
    return obj.pop();
  }
});

var pusher = new Pusher();

obj.push('123');

try {
  pusher.run(obj)         // <--- ОШИБКА! Внутри pusher.run такой функции как pop в объекте obj
                          //     и всех его __proto__ свойствах не существует
} catch(e) {}

console.log(obj.pop());  // <--- Никакой ошибки нет! Метод pop вернулся на свое место!
// > 123
```

Пример с вызовом функции, которая объявлена в родительском конструкторе.

```javacript
/////////////////////
function F() {
  this.field = 'F';
}

F.prototype.fn = function() { return 'I\'m legal function';  };
F.prototype.filth = function() {};

/////////////////////
function G() {
  F.call(this);
  this.gield = 'G';
}

G.prototype = new F();
G.prototype.constructor = G;

G.prototype.gg = function() { return 'I\'m a white rabbit!'; };

/////////////////////
function H() {
  G.call(this);
  this.hield = 'H';
}

H.prototype = new G();
H.prototype.constructor = H;

H.prototype.hh = function() { return 'Who let the dogs out?!'; };

/////////////////////

var h = new H();

var I = new Interface('I', {
  fn: [],
  gg: [],
  hh: []
});

var IHClient = new Interface('IHClient', {
  run: [I]
});

function HClient() {}

Class(HClient, null, IHClient, {
  run: function(h) {
    console.log(h.fn());
    console.log(h.gg());
    console.log(h.hh());
  }
});

var hclient = new HClient();
hclient.run(h);

// > I'm legal function
// > I'm a white rabbit!
// > Who let the dogs out?!
```
