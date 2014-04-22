/*
 * Key handling related logic for the essay editor/reviewer.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {};
peernoteNS.essays.keys = peernoteNS.essays.keys || {};

$.extend(peernoteNS.essays.keys, {

  KEY_CODES: {
    BACKSPACE:    8,
    TAB:          9,
    LEFT_ARROW:   37,
    DOWN_ARROW:   38,
    RIGHT_ARROW:  39,
    DOWN_ARROW:   40,
    V:            86
  },

  KEY_DOWN_HANDLERS: {},

  setupKeys: function() {
    this.registerDownHandler(this.KEY_CODES.LEFT_ARROW, this.leftArrow);
    this.registerDownHandler(this.KEY_CODES.RIGHT_ARROW, this.rightArrow);
  },

  processKeyDown: peernoteNS.errors.wrap(function(evt) {
    var _this = peernoteNS.essays.keys;
    if (_this.KEY_DOWN_HANDLERS[evt.keyCode]) {
      for (var i = 0; i < _this.KEY_DOWN_HANDLERS[evt.keyCode].length; ++i) {
        // Call the key down handler.
        _this.KEY_DOWN_HANDLERS[evt.keyCode][i](evt);
      }
    }
  }),

  registerDownHandler: function(keyCode, handler) {
    if (!this.KEY_DOWN_HANDLERS[keyCode]) {
      this.KEY_DOWN_HANDLERS[keyCode] = [];
    }
    this.KEY_DOWN_HANDLERS[keyCode].push(handler);
  },

  leftArrow: function(e) {
    e.preventDefault();
    peernoteNS.doc.moveCaretLeft();
  },

  rightArrow: function(e) {
    e.preventDefault();
    peernoteNS.doc.moveCaretRight();
  },

  init: function() {
    var _this = peernoteNS.essays.keys;
    _this.setupKeys();
    // TODO: Update the below line to get the document root
    // element more elegantly. This will also probably break
    // in the future.
    var docContainer = $('.page-container .page')[0];
    $(docContainer).keydown(peernoteNS.essays.keys.processKeyDown);
  }

});

peernoteNS.init(peernoteNS.essays.keys.init);
