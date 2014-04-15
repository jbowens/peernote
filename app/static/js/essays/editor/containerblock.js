/*
 * A block element in a document that contains other block elements.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.containerBlock = peernoteNS.containerBlock || {};

$.extend(peernoteNS.containerBlock, {

  BLOCK_TYPE: 'container',

  /* The parent of this block. */
  _parent: null,

  /* Child block elements */
  _children: [],

  _elmt: null,

  /* Creates a new object that is a container block.
   *
   * @param parentBlock (optional) the parent of this block
   */
  construct: function(parentBlock) {
    // Clone container block object and return new one
    var obj = $.extend({}, peernoteNS.containerBlock);
    obj.init();
    obj._parent = parentBlock;
    return obj;
  },

  init: function() {
    this._children = [];
  },

  getState: function() {
    var children = [];
    for (var i = 0; i < this._children.length; ++i) {
      children.push(this._children[i].getState());
    }
    return {
      type: 'container',
      children: children
    };
  },

  /* Takes a serialized state of a block of this type and returns a new block
   * object representing the given block state.
   */
  deserialize: function(state) {
    var newBlock = this.construct();
    for (var i = 0; i < state.children.length; ++i) {
      var child = peernoteNS.doc.deserializeBlock(state.children[i]);
      newBlock.addChild(child);
    }
    return newBlock;
  },

  getParent: function() {
    return this._parent;
  },

  getBlockType: function() {
    return this.BLOCK_TYPE;
  },

  getChildCount: function() {
    return this._children.length;
  },

  /* Gets the index of the given child block. It returns -1 if the given
   * block is not a child of this container.
   */
  getChildIndex: function(child) {
    return $.inArray(child, this._children);
  },

  /* Retrieves the child with the given index.
   */
  getChildAt: function(idx) {
    if (idx < 0 || idx >= this._children.length) {
      return null;
    } else {
      return this._children[idx];
    }
  },

  /* Adds a child block at the end of the containers.
   *
   * @param childBlock  the child block to add
   */
  addChild: function(childBlock) {
    childBlock._parent = this;
    this._children.push(childBlock);
  },

  /* Inserts the given block element after the given reference block.
   * It returns false if the reference block was not found (and thus
   * the child was not inserted.)
   *
   * @param referenceChild  an existing child block to insert after
   * @param newChildBlock   the new child block to insert
   */
  insertChildAfter: function(referenceChild, newChildBlock) {
    var referenceIndex = $.inArray(referenceChild, this._children);
    if (referenceIndex == -1) {
      return false;
    }
    newChildBlock._parent = this;
    this._children.splice(referenceIndex+1, 0, newChildBlock);
    return true;
  },

  /* Removes the given child, both from the block and the
   * DOM.
   */
  removeChild: function(child) {
    var idx = this.getChildIndex(child);
    if (idx == -1) {
      // This isn't a child.
      return false;
    }
    this._children.splice(idx, 1);
    if (child._elmt && child._elmt.parentNode) {
      // This child is rendered on the DOM. Remove it from the DOM.
      child._elmt.parentNode.removeChild(child._elmt);
    }
    return true;
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
