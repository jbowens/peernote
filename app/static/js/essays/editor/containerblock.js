/*
 * A block element in a document that contains other block elements.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.containerBlock = peernoteNS.containerBlock || {};

$.extend(peernoteNS.containerBlock, {

  /* Child block elements
   */
  _children: [],

  /* Creates a new object that is a container block.
   */
  construct: function() {
    // Clone container block object and return new one
    return $.extend({}, peernoteNS.containerBlock).init();
  },

  init: function() {
    // TODO: Any additional initialization.
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
    var renderings = this.renderChildren();
    for (var i = 0; i < renderings.length; ++i) {
      div.appendChild(renderings[i]);
    }
    return div;
  }

});
