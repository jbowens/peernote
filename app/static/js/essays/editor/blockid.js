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
  },

  getBlockById: function(blockid) {
    var toCheck = [peernoteNS.doc._root];
    while (toCheck.length) {
      var block = toCheck.pop();
      if (block._blockid == blockid) {
        return block;
      }
      if (block._children) {
        for (var i = 0; i < block._children.length; ++i) {
          toCheck.push(block._children[i]);
        }
      }
    }
    return null;
  }

});
