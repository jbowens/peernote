/*
 * A block element in a document that contains other block elements.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.containerBlock = peernoteNS.containerBlock || {};

$.extend(peernoteNS.containerBlock, {

  /* Child block elements
   */
  _children: [],

  _elmt: null,

  /* Creates a new object that is a container block.
   */
  construct: function() {
    // Clone container block object and return new one
    var obj = $.extend({}, peernoteNS.containerBlock);
    obj.init();
    return obj;
  },

  init: function() {
    // TODO: Any additional initialization.
  },

  getState: function() {
    // TODO: Implement
    return {};
  },

  /* Renders all the children of this container block and
   * returns the resulting DOM elements in an array.
   */
  renderChildren: function() {
    var renderedChildren = [];
    for (var i = 0; i < this._children.length; ++i) {
      var rendered = this._children[i].render();
      renderedChildren.push(rendered);
    }
    return renderedChildren;
  },

  /* Renders this container block as simple div containing
   * the rendering of all the child nodes.
   */
  render: function() {
    var div = document.createElement('div');
    $(div).addClass('pn-cont-block');
    $(div).addClass('pn-block');
    div.block = this;
    this._elmt = div;
    var renderings = this.renderChildren();
    for (var i = 0; i < renderings.length; ++i) {
      div.appendChild(renderings[i]);
    }
    return div;
  },

  /* Returns a plain-text representation of this element and all its children.
   */
  getText: function() {
    var text = '';
    for (var i = 0; i < this._children.length; ++i) {
      text = text + this._children[i].getText();
    }
    // TODO: Maybe add newlines between children.
    return text;
  }

});
