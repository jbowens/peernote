/*
 * Stores the current state of the document.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.doc = peernoteNS.doc || {};
$.extend(peernoteNS.doc, {

  _text: '',

  _modifiers: [],

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
      /* This modifier is already applied on both the start and end times.
       * We should just coalesce them into one modifier. */
      startMod.end = endMod.end;
      // Remove the end modifier
      this._modifiers.splice($.inArray(endMod, this._modifiers), 1);
      // Reparent the end modifier's nodes
      for (var i = 0; i < endMod.nodes.length; i++) {
        startMod.nodes.push(endMod.nodes[i]);
      }
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

  render: function() {
    // Covert the modifiers into a more digestible format.
    var breaks = [];
    for (var i = 0; i < this._modifiers.length; ++i) {
      breaks.push({
        type: this._modifiers[i].type,
        isStart: true,
        pos: this._modifiers[i].start
      });
      breaks.push({
        type: this._modifiers[i].type,
        isStart: false,
        pos: this._modifiers[i].end
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

    var content = $('.page-container .page')[0];
    $(content).empty();
    content.appendChild(root);
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

});
