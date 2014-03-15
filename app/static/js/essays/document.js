/*
 * Stores the current state of the document.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.doc = peernoteNS.doc || {};
$.extend(peernoteNS.doc, {

  _text: '',

  _modifiers: [],

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
        end: end,
        nodes: []
      };
      this._modifiers.push(newModifier);
    }
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
          end: endMod.end,
          nodes: []
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
  },

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
      // Clear nodes associated with the modifier since we're
      // re-rendering
      this._modifiers[i].nodes = [];
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
        if (b.modifier.start == b.modifier.end) {
          // This is an empty modifier.
          b.modifier.node = span;
        }
        activeModifiers.splice($.inArray(b.type, activeModifiers), 1);
      }
      lastIndex = b.pos;
    }

    // Add the last node
    var span = this._makeNode(activeModifiers, lastIndex, this._text.length);
    root.appendChild(span);

    var content = $('.page-container .page')[0];
    // Save the selection for after we rerender.
    var selection = peernoteNS.docutils.getCaretPosition(content);

    $(content).empty();
    content.appendChild(root);

    // Re-rendering the document will have cleared the selection.
    // We should restore it.
    if (selection.isSelection) {
      peernoteNS.docutils.setSelection(content, selection.start, selection.end);
    } else {
      peernoteNS.docutils.setSelection(content, selection.start);
    }

    return root;
  },

  _makeNode: function(activeModifiers, start, end) {
    var span = document.createElement('span');
    var txt = this._text.substr(start, end - start);
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
  }

});
