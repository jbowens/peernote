/*
 * Logic supporting the ability to paste into documents.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.paste = peernoteNS.paste || {};

$.extend(peernoteNS.paste, {

  /* The textarea used to catch pastes. */
  _pasteCatcher: null,

  /* The caret position when the current paste event began. */
  _pastePosition: null,

  setupPasteCatcher: function() {
    this._pasteCatcher = document.createElement('textarea');
    this._pasteCatcher.id = 'pn-paste-catcher';
    document.body.insertBefore(this._pasteCatcher, document.body.firstChild);
    $(this._pasteCatcher).bind('paste', peernoteNS.paste.pasteEndListener);
  },

  shortcutListener: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.paste;
    if (e.keyCode == peernoteNS.essays.keys.KEY_CODES.V && e.metaKey) {
      // This is a paste event. Move focus to the paste catcher.
      _this._pastePosition = peernoteNS.doc.getCaret();
      _this._pasteCatcher.value = '';
      $(_this._pasteCatcher).focus();
    }
  }),

  pasteEndListener: peernoteNS.errors.wrap(function() {
    window.setTimeout(peernoteNS.paste.processPaste, 1);
  }),

  processPaste: peernoteNS.errors.wrap(function() {
    var _this = peernoteNS.paste;
    var pastedText = _this._pasteCatcher.value;
    // Restore the caret
    peernoteNS.doc.setCaret(_this._pastePosition);
    // Insert the new text
    peernoteNS.doc.insertAtCaret(pastedText);
  }),

  init: function() {
    this.setupPasteCatcher();
    var doc = $('.page-container .page');
    doc.keydown(this.shortcutListener);
  }

});

peernoteNS.init(function() {
  peernoteNS.paste.init();
});
