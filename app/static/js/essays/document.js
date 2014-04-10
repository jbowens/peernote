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
    $('.page-container .page').keyup(peernoteNS.errors.wrap(function(e) {
      _this.checkForChanges(e);
    }));
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

  /* Applies the given modifier over the given selection.
   */
  applyModifier: function(modifierType, selection) {
    if (selection.startBlock == selection.endBlock) {
      // This selection only spans a single block. Apply the
      // modifier to the range within the block.
      selection.anchorBlock.applyModifier(modifierType,
                                          selection.startOffset,
                                          selection.endOffset);
    } else {
      // TODO: Implement
      console.log("NOT YET IMPLEMENTED: applyModifier across blocks");
    }
  },

  /* Removes the given modifier over the given selection.
   */
  removeModifier: function(modifierType, selection) {
    if (selection.startBlock == selection.endBlock) {
      // This selection only spans a single block. Remove the
      // modifier from the range within the block.
      selection.startBlock.removeModifier(modifierType,
                                          selection.startOffset,
                                          selection.endOffset);
    } else {
      // TODO: Implement
      console.log("NOT YET IMPLEMENTED: removeModifier across blocks");
    }
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
    pos.anchorOffset = peernoteNS.docutils.getOffset(pos.anchorBlock._elmt,
                                                     s.anchorNode,
                                                     s.anchorOffset);
    pos.focusBlock = this._getContainingBlock(s.focusNode, s.focusOffset);
    pos.focusOffset = peernoteNS.docutils.getOffset(pos.focusBlock._elmt,
                                                    s.focusNode,
                                                    s.focusOffset);
    pos.anchorChar = peernoteNS.docutils.getOffset(this._root._elmt,
                                                   s.anchorNode,
                                                   s.anchorOffset);
    pos.focusChar = peernoteNS.docutils.getOffset(this._root._elmt,
                                                   s.focusNode,
                                                   s.focusOffset);
    if (pos.anchorChar <= pos.focusChar) {
      pos.startChar = pos.anchorChar;
      pos.endChar = pos.focusChar;
      pos.startBlock = pos.anchorBlock;
      pos.startOffset = pos.anchorOffset;
      pos.endBlock = pos.focusBlock;
      pos.endOffset = pos.focusOffset;
    } else {
      pos.startChar = pos.focusChar;
      pos.endChar = pos.anchorChar;
      pos.startBlock = pos.focusBlock;
      pos.startOffset = pos.focusOffset;
      pos.endBlock = pos.anchorBlock;
      pos.endOffset = pos.anchorOffset;
    }

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
