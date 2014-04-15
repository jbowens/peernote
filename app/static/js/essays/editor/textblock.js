/*
 * A text block element. It cannot contain other blocks, only plain
 * text with modifiers.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.textBlock = peernoteNS.textBlock || {};

$.extend(peernoteNS.textBlock, {

  BLOCK_TYPE: 'text',

  _parent: null,

  _text: '',

  _modifiers: [],

  _elmt: null,

  /* Creates a new object that is a container block.
   *
   * @param parentBlock (optional) the parent of this block
   */
  construct: function(parentBlock) {
    // Clone text block object and return new one
    var obj = $.extend({}, peernoteNS.textBlock)
    obj.init();
    obj._parent = parentBlock;
    return obj;
  },

  init: function() {
    this._modifiers = [];
  },

  getText: function() {
    return this._text;
  },

  getTextLength: function() {
    return this._text.length;
  },

  getParent: function() {
    return this._parent;
  },

  getBlockType: function() {
    return this.BLOCK_TYPE;
  },

  /* Returns an object encapsulating the entire state of the
   * document.
   */
  getState: function() {
    // Copy the modifiers
    var modifiers = [];
    for (var i = 0; i < this._modifiers.length; ++i) {
      modifiers.push({
        type: this._modifiers[i].type,
        start: this._modifiers[i].start,
        end: this._modifiers[i].end
      });
    }

    return {
      type: 'text',
      text: this._text,
      modifiers: modifiers
    };
  },

  /* Takes a serialized state of a block of this type and returns a new block
   * object representing the given block state.
   */
  deserialize: function(state) {
    var newBlock = this.construct();
    newBlock._text = state.text;
    newBlock._modifiers = state.modifiers;
    return newBlock;
  },

  /* Deletes the character at the given position and then
   * re-renders the block in place.
   */
  deleteCharacter: function(pos) {
    this._text = this._text.substr(0, pos - 1) + this._text.substr(pos);
    /* Update modifiers' offsets. */
    for (var i = 0; i < this._modifiers.length; ++i) {
      var mod = this._modifiers[i];
      if (mod.start >= pos) {
        mod.start = mod.start - 1;
      }
      if (mod.end >= pos) {
        mod.end = mod.end - 1;
      }
    }
    this.rerenderInPlace();
  },

  /* Splits the block at the given plain-text offset within the block,
   * returning the newly created second-half block.
   */
  splitAt: function(offset) {
    var newBlock = peernoteNS.textBlock.construct();
    newBlock._text = this._text.substr(offset);
    this._text = this._text.substr(0, offset);
    var i = this._modifiers.length;
    while (i--) {
      var mod = this._modifiers[i];
      if (mod.start >= offset) {
        /* This modifier belongs only in the new block. */
        this._modifiers.splice(i, 1);
        newBlock._modifiers.push({
          type: mod.type,
          start: mod.start - offset,
          end: mod.end - offset
        });
      } else if (mod.end <= offset) {
        /* This modifier belongs only in the original block. */
        /* We don't actually have to do anything here. :D */
      } else {
        /* This modifier spans the split point, so we need to break it
         * into two modifiers, one for each block. */
        newBlock._modifiers.push({
          type: mod.type,
          start: 0,
          end: mod.end - offset
        });
        mod.end = this._text.length;
      }
    }
    this._parent.insertChildAfter(this, newBlock);
    return newBlock;
  },

  /* Coalesces this block with its successor. This function does not
   * touch the caret. The caller is responsible for restoring the caret
   * location if desired.
   */
  coalesce: function(successorBlock) {
    /* Remove the succssor block. */
    this._parent.removeChild(successorBlock);
    var offset = this._text.length;
    this._text = this._text + successorBlock._text;
    /* Copy over the modifiers */
    for (var i = 0; i < successorBlock._modifiers.length; ++i) {
      var mod = successorBlock._modifiers[i];
      this._modifiers.push({
        type: mod.type,
        start: mod.start + offset,
        end: mod.end + offset
      });
    }
    /* Re-render the new, coalesced node. */
    this.rerenderInPlace();
  },

  getElementText: function() {
    // We don't want any zero width spaces.
    var ZERO_WIDTH_SPACE = String.fromCharCode(parseInt('200B', 16));
    var txt = this._elmt.innerText;
    var idx = txt.indexOf(ZERO_WIDTH_SPACE);
    while (idx != -1) {
      if (idx != -1) {
        txt = txt.slice(0, idx) + txt.slice(idx + 1, txt.length);
      }
      idx = txt.indexOf(ZERO_WIDTH_SPACE);
    }
    return txt;
  },

  checkForChanges: function(pos) {
    var elmtText = this.getElementText();
    if (this._text != elmtText) {
      var charDiff = elmtText.length - this._text.length;
      // Update the stored representation of the document.
      this.updateText(elmtText,
                      pos.startOffset - charDiff,
                      charDiff);
      // TODO: Handle these pending modifiers.
      /*
      if (_this._pendingModifiers.length &&
          _this._pendingModifiersPos == pos.start - charDiff) {
        if (charDiff > 0) {
          // If they added characters, we should now wrap those characters
          // in the pending modifiers.
          for (var i = 0; i < _this._pendingModifiers.length; ++i) {
            var type = _this._pendingModifiers[i];
            peernoteNS.doc.applyModifier(type, pos.start-charDiff, pos.start);
          }
          // Re-render the document to reflect the new modifier.
          peernoteNS.doc.render();
        }
        // Clear pending modifiers
        _this._pendingModifiers = [];
      }
      */
      return true;
    }
    return false;
  },

  updateText: function(newText, position, charsDiff) {
    /* Update the raw plain text of the document. */
    this._text = newText;
    var len = this._text.length;
    var l = len;

    /* Update all modifiers with the new offsets. */
    for (var i = 0; i < this._modifiers.length; ++i) {
      if (this._modifiers[i].start >= position) {
        this._modifiers[i].start += charsDiff;
      }
      if (this._modifiers[i].end >= position) {
        this._modifiers[i].end += charsDiff;
      }

      // If this modifier extends past the end of the document,
      // shorten it.
      if (this._modifiers[i].end > len) {
        this._modifiers[i].end = len;
      }

      // If this modifier starts past the end of the document, remove it.
      if (this._modifiers[i].start >= len) {
        this._modifiers.splice(i, 1);
        // Since we spliced, the array got re-indexed and we need to
        // decrement the index so we don't skip an index.
        i--;
      }
    }

    this._removeZeroLengthModifiers();
  },

  /* Finds all modifiers in effect at the given position.
   *
   * @param position the position to find modifiers for
   * @return a list of all the modifiers in effect
   */
  getModifiers: function(position) {
    var mods = [];
    for (var i = 0; i < this._modifiers.length; ++i) {
      if (this._modifiers[i].start <= position &&
          this._modifiers[i].end >= position) {
        mods.push(this._modifiers[i].type);
      }
    }
    return mods;
  },

  /* Applies the given modifier for the given range.
   *
   * @param modifierType the type of modifier to apply
   * @param start the start text offset
   * @param end the end text offset
   */
  applyModifier: function(modifierType, start, end) {
    var startMod = this._getModifierOfTypeAt(modifierType, start);
    var endMod = this._getModifierOfTypeAt(modifierType, end);

    // Delete modifiers completely contained within the interval.
    var defuntModifiers = this._getModifiersOfTypeWithinRange(modifierType, start, end);
    for (var i = 0; i < defuntModifiers.length; ++i) {
      this._modifiers.splice($.inArray(defuntModifiers[i], this._modifiers), 1);
    }

    if (startMod && endMod) {
      if (startMod == endMod) {
        /* This region already has the given modifier type applied by a
         * single modifier. There's no need to do anything. */
        return;
      }
      /* This modifier is already applied on both the start and end times.
       * We should just coalesce them into one modifier. */
      startMod.end = endMod.end;
      // Remove the end modifier
      this._modifiers.splice($.inArray(endMod, this._modifiers), 1);
    } else if (startMod) {
      startMod.end = end;
    } else if (endMod) {
      endMod.start = start;
    } else {
      var newModifier = {
        type: modifierType,
        start: start,
        end: end
      };
      this._modifiers.push(newModifier);
    }

    this._removeZeroLengthModifiers();
  },

  /* Removes the all modifiers of the given type over the given range.
   *
   * @param modiferType the type of modifier to remvoe
   * @param start the start text offset
   * @param end the ending text offset
   */
  removeModifier: function(modifierType, start, end) {
    var startMod = this._getModifierOfTypeAt(modifierType, start);
    var endMod = this._getModifierOfTypeAt(modifierType, end);

    // Delete modifiers completely contained within the interval.
    var defuntModifiers = this._getModifiersOfTypeWithinRange(modifierType, start, end);
    for (var i = 0; i < defuntModifiers.length; ++i) {
      this._modifiers.splice($.inArray(defuntModifiers[i], this._modifiers), 1);
    }

    if (startMod && endMod && startMod == endMod) {
      // There's one big modifier that extends over this interval. We need to split it
      // into two modifiers.
      if (endMod.end > end) {
        var newModifier = {
          type: modifierType,
          start: end,
          end: endMod.end
        };
        this._modifiers.push(newModifier);
      }
      startMod.end = start;
      if (startMod.end == startMod.start) {
        // This is a zero-length modifier. Just remove it.
        this._modifiers.splice($.inArray(startMod, this._modifiers), 1);
      }
    } else {
      if (startMod) {
        // Make the modifier at the beginning end earlier.
        startMod.end = start;
      }
      if (endMod) {
        // Make the modifier on the end start later.
        endMod.start = end;
      }
    }

    this._removeZeroLengthModifiers();
  },

  /* Completely re-render this block, returning the DOM element
   * that will display this block within the page.
   */
  render: function() {
    // Covert the modifiers into a more digestible format.
    var breaks = [];
    for (var i = 0; i < this._modifiers.length; ++i) {
      breaks.push({
        type: this._modifiers[i].type,
        isStart: true,
        pos: this._modifiers[i].start,
        modifier: this._modifiers[i]
      });
      breaks.push({
        type: this._modifiers[i].type,
        isStart: false,
        pos: this._modifiers[i].end,
        modifier: this._modifiers[i]
      });
    }
    // Sort the breaks by position, ascending
    breaks.sort(function(a, b) { return a.pos - b.pos; });

    var lastIndex = 0;
    var activeModifiers = [];
    var root = document.createElement('div');
    for (var i = 0; i < breaks.length; ++i) {
      var b = breaks[i];
      var span = this._makeNode(activeModifiers, lastIndex, b.pos);
      root.appendChild(span);

      if (b.isStart) {
        activeModifiers.push(b.type);
      } else {
        activeModifiers.splice($.inArray(b.type, activeModifiers), 1);
      }
      lastIndex = b.pos;
    }

    // Add the last node
    var span = this._makeNode(activeModifiers, lastIndex, this._text.length);
    root.appendChild(span);

    // Setup the text block container
    $(root).addClass('pn-text-block');
    $(root).addClass('pn-block');
    root.block = this;
    this._elmt = root;

    return root;
  },

  /* Re-renders the block, replacing the old rendering with the new.
   * This function fails and returns false if this block isn't currently
   * rendered on the screen.
   */
  rerenderInPlace: function() {
    var oldElmt = this._elmt;
    if (!oldElmt || !oldElmt.parentNode) {
      // This block doesn't exist in the DOM, so we can't rerender it!
      return false;
    }
    var newElmt = this.render();
    oldElmt.parentNode.insertBefore(newElmt, oldElmt);
    oldElmt.parentNode.removeChild(oldElmt);
    return true;
  },

  _makeNode: function(activeModifiers, start, end) {
    var span = document.createElement('span');
    var txt = this._text.substr(start, end - start);
    var ZERO_WIDTH_SPACE = String.fromCharCode(parseInt('200B', 16));
    txt = txt + ZERO_WIDTH_SPACE;
    var txtNode = document.createTextNode(txt);
    span.appendChild(txtNode);
    for (var j = 0; j < activeModifiers.length; ++j) {
      $(span).addClass('mod-' + activeModifiers[j]);
    }
    return span;
  },

  /* Retrieves all modifiers in effect at the given text position.
   *
   * @param position the text offset we're looking up
   * @return an array of modifier objects
   */
  _getModifiersAt: function(position) {
    var modifiers = [];
    for (var i = 0; i < this._modifiers.length; ++i) {
      if (this._modifiers[i].start <= position &&
          this._modifiers[i].end >= position) {
        modifiers.push(this._modifiers[i]);
      }
    }
    return modifiers;
  },

  /* Get modifier of a specific type at the given text position if it
   * exists.
   *
   * @param modifierType the type of modifier to lookup
   * @param position the text offset we're looking up
   * @return the modifier objects
   */
  _getModifierOfTypeAt: function(modifierType, position) {
    for (var i = 0; i < this._modifiers.length; ++i) {
      if (this._modifiers[i].start <= position &&
          this._modifiers[i].end >= position &&
          this._modifiers[i].type == modifierType) {
        return this._modifiers[i];
      }
    }
    return null;
  },

  /* Retrieves modifiers within the given range of the given type. It only
   * includes modifiers that are COMPLETELY contained within the interval.
   * It does not include modifiers that start or end exactly on the bounds
   * of the interval.
   *
   * @param modifierType the type of modifier to lookup
   * @param start the start offset
   * @param end the end offset
   * @return a list of modifiers
   */
  _getModifiersOfTypeWithinRange: function(modifierType, start, end) {
    var mods = [];
    for (var i = 0; i < this._modifiers.length; ++i) {
      if (this._modifiers[i].start > start &&
          this._modifiers[i].end < end &&
          this._modifiers[i].type == modifierType) {
        mods.push(this._modifiers[i]);
      }
    }
    return mods;
  },

  /* Retrieves all zero-length modifiers at the given position.
   *
   * @param pos the position to lookup
   * @return a list of all zero-length modifiers at the given position
   */
  _getZeroLengthModifiersAt: function(pos) {
    var zeroLengthMods = [];
    var mods = this._getModifiersAt(pos);
    for (var i = 0; i < mods.length; ++i) {
      if (mods[i].start == mods[i].end) {
        zeroLengthMods.push(mods[i]);
      }
    }
    return zeroLengthMods;
  },

  /* Removes all zero length modifiers in the document.
   */
  _removeZeroLengthModifiers: function() {
    for (var i = 0; i < this._modifiers.length; i++) {
      if (this._modifiers[i].start == this._modifiers[i].end) {
        this._modifiers.splice(i, 1);
        i--;
      }
    }
  }

});