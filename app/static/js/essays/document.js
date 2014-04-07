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
    this._root = peernoteNS.textBlock.construct();
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

});
