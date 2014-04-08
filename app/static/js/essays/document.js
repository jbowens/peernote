/*
 * Stores the current state of the document.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.doc = peernoteNS.doc || {};
$.extend(peernoteNS.doc, {

  /* Listeners that should be notified when the document
   * changed.
   */
  _changeListeners: [],

  _root: null,

  init: function() {
    var _this = this;
    this._root = peernoteNS.containerBlock.construct();
    this._root._children.push(peernoteNS.textBlock.construct());
    $('.page-container .page').keyup(function(e) {
      _this.checkForChanges(e);
    });
    this.render();
  },

  checkForChanges: function(e) {
    var pos = this.getCaret();
    var changesMade = pos.anchorBlock.checkForChanges(pos);
    if (changesMade) {
      this._documentChanged();
    }
  },

  addChangeListener: function(f) {
    this._changeListeners.push(f);
  },

  getText: function() {
    return this._root.getText();
  },

  /* Returns an object encapsulating the entire state of the
   * document.
   */
  getState: function() {
    return this._root.getState();
  },

  /* This function should be called whenever the document changes to
   * notify and listeners that the document has been modified.
   */
  _documentChanged: function() {
    var state = this.getState();
    for (var i = 0; i < this._changeListeners.length; ++i) {
      this._changeListeners[i](state);
    }
  },

  /* Re-renders the entire document.
   */
  render: function() {
    var renderedRoot = this._root.render();
    var content = $('.page-container .page')[0];
    $(content).empty();
    content.appendChild(renderedRoot);
    return renderedRoot;
  },

  /* Retrieves the caret position / selection in terms of
   * logical block elements.
   */
  getCaret: function() {
    var s = document.getSelection();
    var pos = {
      selectionObj: s,
      isSelection: s.anchorNode != s.focusNode || s.anchorOffset != s.focusOffset
    };
    pos.anchorBlock = this._getContainingBlock(s.anchorNode, s.anchorOffset);
    pos.anchorOffset = s.anchorOffset;
    pos.focusBlock = this._getContainingBlock(s.focusNode, s.focusOffset);
    pos.focusOffset = s.focusOffset;
    return pos;
  },

  _getContainingBlock: function(node, nodeOffset) {
    if (!node) {
      return null;
    }

    var isPage = $(node).hasClass('page');
    if (isPage) {
      // This is a top level document node. Return the first block contained within it.
      var blocks = $('.page > .pn-block');
      if (blocks.length) {
        return blocks[0].block;
      } else {
        return null;
      }
    } else {
      /* Find the containing block for the anchor. */
      var elmt = $(node).closest('.pn-block');
      /* It could be that the content-editable put the focus outside of a block
       * chilling in a top-level text node, in which case we should move to the next sibling. */
      if (elmt.length) {
        elmt = elmt[0];
      } else if (node.nextSibling) {
        elmt = node.nextSibling;
      } else {
        elmt = node.previousSibling;
      }
      return elmt.block;
    }
 },

});
