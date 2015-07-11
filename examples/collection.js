'use strict';

var clint = require('../index');
var Interface = clint.Interface;
var Class = clint.Class;

var ICollectionItem = new Interface('ICollectionItem', {
  getKey: {args: [], result: String}
});

var ICollection = new Interface('ICollection', {
  add: [ICollectionItem],
  remove: [ICollectionItem],
  has: [ICollectionItem]
});

function Collection() {
  this.items = {};
}

Class(Collection, null, [ICollection], {
  add: function(newItem) {
    this.items[newItem.getKey()] = newItem;
    return this;
  },
  remove: function(item) {
    delete this.items[item.getKey()];
    return this;
  },
  has: function(item) {
    return typeof this.items[item.getKey()] !== 'undefined';
  }
});
