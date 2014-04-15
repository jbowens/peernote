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
    this._root.addChild(peernoteNS.textBlock.construct());
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

  /* Sets the state of the document to be the given
   * serialized document state.
   */
  setState: function(body) {
    this._root = this.deserializeBlock(body);
  },

  deserializeBlock: function(state) {
    // Iterate through supported block types and find the
    // appropriate block to deserialize it.
    var blockTypes = peernoteNS.editor.BLOCK_TYPES;
    for (var i = 0; i < blockTypes.length; ++i) {
      if (blockTypes[i].getBlockType() == state.type) {
        return blockTypes[i].deserialize(state);
      }
    }
    return null;
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

  /* Deletes a character at the caret, or if there is currently a text
   * selection, deletes the selection.
   */
  deleteAtCaret: function() {
    var pos = this.getCaret();
    if (pos.isSelection) {
      // TODO: Implement
      console.log("NOT YET IMPLEMENTED: delete selection");
    } else {
      if (pos.startOffset) {
        pos.startBlock.deleteCharacter(pos.startOffset);
        this.setCaret({
          startBlock: pos.startBlock,
          startOffset: pos.startOffset - 1
        });
      } else if (pos.startBlock.getParent().getChildIndex(pos.startBlock)) {
        // The caret is at the beginning of a block that isn't the first block,
        // so we should delete a 'newline', coalescing this block with the block
        // preceding it.
        var parentBlock = pos.startBlock.getParent();
        var childIndex = parentBlock.getChildIndex(pos.startBlock);
        var predecessor = parentBlock.getChildAt(childIndex - 1);
        var predecessorLength = predecessor.getTextLength();
        predecessor.coalesce(pos.startBlock);
        this.setCaret({
          startBlock: predecessor,
          startOffset: predecessorLength
        });
      }
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
    var caretPos = this.getCaret();
    var renderedRoot = this._root.render();
    var content = $('.page-container .page')[0];
    $(content).empty();
    content.appendChild(renderedRoot);
    // Restore the caret position, if a previous caret position exists.
    if (caretPos) {
      this.setCaret(caretPos);
    }
    return renderedRoot;
  },

  /* Creates a new text block at the caret (or replacing the current
   * selection if there is a selection). It returns the created text
   * block.
   */
  createNewBlock: function() {
    // Create the new text block.
    var pos = this.getCaret();
    if (pos.isSelection) {
      // We're replacing text with a new block.
      // TODO: Implement
      console.log("Not Yet Implemented: New block replacing selection");
      return null;
    } else {
      // We're just inserting a new block at the current caret position.
      // We must split the current block into two blocks, splitting the
      // text and modifiers across the block.
      var newBlock = pos.startBlock.splitAt(pos.startOffset);
      this.render();
      // Shift focus to the new block
      this.setCaret({
        startBlock: newBlock,
        startOffset: 0
      });
    }
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
    if (pos.anchorBlock == null) {
      // The selection is outside of the editor.
      return null;
    }
    pos.anchorOffset = peernoteNS.docutils.getOffset(pos.anchorBlock._elmt,
                                                     s.anchorNode,
                                                     s.anchorOffset);
    pos.focusBlock = this._getContainingBlock(s.focusNode, s.focusOffset);
    if (pos.focusBlock == null) {
      // The selection is outside of the editor.
      return null;
    }
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

  /* Sets the caret position/selection to be the given position.
   *
   * The given pos object must have the following properties:
   *  - startBlock  the block at which to begin the selection
   *  - startOffset the plain text offset within the block to start
   *  - endBlock  the block at which to end the selection
   *  - endOffset the plain text offset within the block to end
   */
  setCaret: function(pos) {
    var ZERO_WIDTH_SPACE = String.fromCharCode(parseInt('200B', 16));
    var s = document.getSelection();
    s.removeAllRanges();
    var newRange = document.createRange();

    // Translate the plain text offset to the actual text node and
    // corresponding offset.
    var loc = peernoteNS.docutils.getNodeAtOffset(pos.startBlock._elmt,
                                                  pos.startOffset);
    if (loc == false) {
      // This isn't a valid caret position.
      return false;
    }

    if (loc.node.nodeValue == '') {
      // There's a bug in WebKit and IE that makes it impossible to put
      // a caret at the beginning of an empty text node.
      //
      // See:
      // https://bugs.webkit.org/show_bug.cgi?id=23189
      // http://stackoverflow.com/questions/5488809/how-to-place-caret-inside-an-empty-dom-element-node
      // To work around for now, we add a zero-width space to all empty text nodes.
      // It's important that as soon as text is inserted again, we removed the
      // space to ensure things like arrow keys and backspaces work as expected.
      loc.node.nodeValue = ZERO_WIDTH_SPACE;
    }

    newRange.setStart(loc.node, loc.nodeOffset);

    if (pos.endBlock) {
      // Translate the plain text offset to the actual text node and
      // corresponding offset.
      var endLoc = peernoteNS.docutils.getNodeAtOffset(pos.endBlock._elmt,
                                                       pos.endOffset);
      newRange.setEnd(endLoc.node, endLoc.nodeOffset);
    }

    s.addRange(newRange);
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
