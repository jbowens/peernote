/*
 * Undo redo stack support. Anything modifying the document should be
 * formed as a command object and then executed through this object's
 * execute() method. This will ensure it's registered in the undo/redo
 * stack.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.commands = peernoteNS.commands || {};
$.extend(peernoteNS.commands, {

  // The undo stack of commands
  _undo_stack: [],

  // The redo stack of commands
  _redo_stack: [],

  // command types enum
  TYPES: {
    UNDEFINED:  0,
    TEXT:       1,
    BOLD:       2,
    ITALIC:     3,
    UNDERLINE:  4
  },

  /*
   * Performs the given command and adds it to the undo stack.
   *
   * @param a Command object.
   */
  execute: function(cmd) {
    // Verify that the command object is valid.
    if (!cmd.execute || !cmd.revert || !cmd.type) {
      peernoteNS.errors.record({'msg': 'Attempted to execute a non command object: ' + cmd});
      return false;
    }

    cmd.execute();
    this._undo_stack.push(cmd);
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
      cmd.revert();
      this._redo_stack.push(cmd);
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
      cmd.execute();
      this._undo_stack.push(cmd);
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
      if (e.keyCode == 90) {
        // They hit ctrl+z or cmd+z. We should undo.
        e.preventDefault();
        _this.undo();
      }
      // TODO: Figure out the redo shortcut we want.
    }
  }),

  /* Initalize's key handlers to implement keyboard shortcuts.
   */
  initShortcuts: function() {
    $(document).keydown(peernoteNS.commands.shortcutKeydownListener);
  }

});

peernoteNS.init(peernoteNS.commands.initShortcuts);
