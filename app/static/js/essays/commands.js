/*
 * Undo redo stack support. Anything modifying the document should be
 * formed as a command object and then executed through this object's
 * execute() method. This will ensure it's registered in the undo/redo
 * stack.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.commands = peernoteNS.commands || {};

$.extend(peernoteNS.commands, {

  // Listeners waiting to hear when a command happens.
  _listeners: [],

  // The undo stack of commands
  _undo_stack: [],

  // The redo stack of commands
  _redo_stack: [],

  // command types enum
  TYPES: {
    UNDEFINED:    0,
    TEXT:         1,
    BOLD:         2,
    ITALIC:       3,
    UNDERLINE:    4,
    LEFT_ALIGN:   5,
    CENTER_ALIGN: 6,
    RIGHT_ALIGN:  7,
    NEWLINE:      8,
    TAB:          9,
    TYPING:      10
  },

  addListener: function(f) {
    this._listeners.push(f);
  },

  /*
   * Performs the given command and adds it to the undo stack.
   *
   * @param a Command object.
   */
  execute: function(cmd) {
    // Verify that the command object is valid.
    if (!cmd.execute) {
      peernoteNS.errors.record({'msg': 'Attempted to execute a non command object: ' + cmd});
      return false;
    }

    cmd.beforeState = peernoteNS.doc.getState();
    cmd.execute();
    cmd.afterState = peernoteNS.doc.getState();
    this._redo_stack = [];
    this._undo_stack.push(cmd);
    this._changed();
  },

  /* Adds the custom command to the undo stack. This is used for undo/redo
   * commands whose before and after states are manually mantained by the
   * caller.
   */
  alreadyExecuted: function(cmd) {
    this._redo_stack = [];
    this._undo_stack.push(cmd);
    this._changed();
  },

  /*
   * Undos the most recent item on the undo stack. Returns true if
   * there was a command to undo, false otherwise.
   */
  undo: function() {
    var cmd = this._undo_stack.pop();
    if (!cmd) {
      return false;
    } else {
      peernoteNS.doc.setState(cmd.beforeState);
      this._redo_stack.push(cmd);
      this._changed();
      return true;
    }
  },

  /*
   * Redos the most recently undone command. Returns true if there
   * was a command to redo, false otherwise.
   */
  redo: function() {
    var cmd = this._redo_stack.pop();
    if (!cmd) {
      return false;
    } else {
      peernoteNS.doc.setState(cmd.afterState);
      this._undo_stack.push(cmd);
    this._changed();
      return true;
    }
  },

  /*
   * Clears the entire undo-redo stack.
   */
  clear: function() {
    this._undo_stack = [];
    this._redo_stack = [];
  },

  /* Key down event listener that handles undo and
   * redo keyboard shortcuts.
   */
  shortcutKeydownListener: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.commands;
    if (e.metaKey) {
      if (e.keyCode == peernoteNS.essays.keys.KEY_CODES.Z) {
        // They hit ctrl+z or cmd+z. We should undo.
        e.preventDefault();
        _this.undo();
      } else if (e.keyCode == peernoteNS.essays.keys.KEY_CODES.Y ||
          (e.keyCode == peernoteNS.essays.keys.KEY_CODES.Z && e.shiftKey)) {
        // They hit ctrl+y/ctrl+shift+z. We should undo.
        e.preventDefault();
        _this.redo();
      }
    }
  }),

  /* Initalize's key handlers to implement keyboard shortcuts.
   */
  initShortcuts: function() {
    $(document).keydown(peernoteNS.commands.shortcutKeydownListener);
  },

  _changed: function() {
    for (var i = 0; i < this._listeners.length; ++i) {
      this._listeners[i](this._undo_stack.length, this._redo_stack.length);
    }
  },

});

peernoteNS.init(function() {
    peernoteNS.commands.initShortcuts();
});
