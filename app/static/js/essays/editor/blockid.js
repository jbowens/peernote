/*
 * Handles block ids for identifying blocks within a document.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.editor = peernoteNS.editor || {};
peernoteNS.editor.blockid = peernoteNS.editor.blockid || {};

$.extend(peernoteNS.editor.blockid, {

  _current: 0,

  next: function() {
    ++this._current;
    return this._current;
  },

  reset: function(maxUsed) {
    if (maxUsed) {
      this._current = maxUsed;
    } else {
      this._current = 0;
    }
  },

  max: function() {
    return this._current;
  }

});
