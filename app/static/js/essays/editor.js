/*
 * Editor related logic. Listeners for editor buttons, etc. live here.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.editor = peernoteNS.editor || {};

/* We declare _simpleModifierToggler first so that it may be used when
 * initializing other peernoteNS.editor properties.
 */
$.extend(peernoteNS.editor, {
  /* Returns a function that can be used to set a given block
   * modifier.
   */
  _blockModifier: function(modifierType, commandType) {
    return peernoteNS.errors.wrap(function(e) {
      e.preventDefault();
      var _this = peernoteNS.editor;
      var pos = peernoteNS.doc.getCaret();
      if (!pos) {
        // The focus is not in the editor.
        return;
      }

      _this.removeAllAligns(pos);
      peernoteNS.doc.applyBlockModifier(modifierType, pos);
      peernoteNS.doc.setCaret(pos);
    });
  },

  /* Takes the name of a modifier type and returns a function that
   * can be used to toggle the given modifier. It should be installed
   * as a listener on the appropriate button that toggles the modifier.
   *
   * @param modifierType the modifier type
   * @param commandType a member of the command.TYPES enum
   * @return a function that can toggle the given modifier
   */
  _simpleModifierToggler: function(modifierType, commandType) {
    return peernoteNS.errors.wrap(function(e) {
      var _this = peernoteNS.editor;
      var sel = peernoteNS.doc.getCaret();
      if (!sel) {
        // The focus is not in the editor.
        return;
      }
      if (sel.isSelection) {
        var modifiers = sel.startBlock.getModifiers(sel.startOffset);
        var isApply = $.inArray(modifierType, modifiers) == -1;
        var apply = function() {
          peernoteNS.doc.applyModifier(modifierType, sel);
          peernoteNS.doc.render();
        };
        var unapply = function() {
          peernoteNS.doc.removeModifier(modifierType, sel);
          peernoteNS.doc.render();
        };
        var cmd = {
          type: commandType,
          execute: isApply ? apply : unapply,
          revert: isApply ? unapply : apply
        };
        peernoteNS.commands.execute(cmd);
      } else {
        // TODO: Maybe turn this into an undo-able command.
        // Check for out of date pending modifiers from other locations
        if (_this._pendingModifiers.length &&
            (sel.startBlock != _this._pendingModifiersBlock ||
             sel.startOffset != _this._pendingModifiersOffset)) {
          _this._pendingModifiers = [];
        }

        var pendingIndex = $.inArray(modifierType, _this._pendingModifiers);
        if (pendingIndex == -1) {
          _this._pendingModifiers.push(modifierType);
          _this._pendingModifiersBlock = sel.startBlock;
          _this._pendingModifiersOffset = sel.startOffset;
        } else {
          _this._pendingModifiers.splice(pendingIndex, 1);
        }
      }
    });
  }
});

/*
 * Initialize the rest of peernoteNS.editor.
 *
 */
$.extend(peernoteNS.editor, {
  // Autosaving isn't enabled until the draft is loaded via ajax.
  enable_autosave: false,

  AUTOSAVE_PAUSE_MILLIS: 1000,

  /* setTimeout() timer handle used for implementing
   * autosaving after a pause in writing.
   */
  autosave_timer: null,

  _pendingModifiersBlock: null,
  _pendingModifiersOffset: null,
  _pendingModifiers: [],

  /* A list of all valid block types.
   */
  BLOCK_TYPES: [],

  _doc: null,

  keypress: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.editor;
    if (e.keyCode == 13) {
      // They hit enter. We should create a new block.
      e.preventDefault();
      peernoteNS.doc.createNewBlock();
    }
  }),

  backspaceHandler: function(e) {
    var _this = peernoteNS.editor;
    if (peernoteNS.essays.currentMode == peernoteNS.essays.MODES.EDIT) {
      // They hit backspace. We should delete a character.
      e.preventDefault();
      peernoteNS.doc.deleteAtCaret();
    }
  },

  /* Togglers for simple modifiers. These are installed as listeners for
   * their corrsesponding UI elements.
   */
  bold: peernoteNS.editor._simpleModifierToggler('bold',
      peernoteNS.commands.TYPES.BOLD),

  italic: peernoteNS.editor._simpleModifierToggler('italic',
      peernoteNS.commands.TYPES.ITALIC),

  underline: peernoteNS.editor._simpleModifierToggler('underline',
      peernoteNS.commands.TYPES.UNDERLINE),

  /* Controls for block modifiers. */
  leftAlign: peernoteNS.editor._blockModifier('left-align',
      peernoteNS.commands.TYPES.LEFT_ALIGN),

  centerAlign: peernoteNS.editor._blockModifier('center-align',
      peernoteNS.commands.TYPES.CENTER_ALIGN),

  rightAlign: peernoteNS.editor._blockModifier('right-align',
      peernoteNS.commands.TYPES.RIGHT_ALIGN),

  removeAllAligns: function(pos) {
    var blocks = peernoteNS.doc.getBlocksInCaretPos(pos);
    for (var i = 0; i < blocks.length; ++i) {
      var b = blocks[i];
      if (b.hasBlockModifier('left-align'))
        b.removeBlockModifier('left-align');
      if (b.hasBlockModifier('center-align'))
        b.removeBlockModifier('center-align');
      if (b.hasBlockModifier('right-align'))
        b.removeBlockModifier('right-align');
    }
  },

  /* Event listener for when the undo button is clicked.
   */
  undo: peernoteNS.errors.wrap(function(e) {
    // TODO: We may want to update the UI to reflect whether there
    // are actions that my be undone.
    peernoteNS.commands.undo();
  }),

  /* Event listener for when the redo button is clicked.
   */
  redo: peernoteNS.errors.wrap(function(e) {
    // TODO: We may want to update the UI to reflect whether there
    // are actions that my be redone.
    peernoteNS.commands.redo();
  }),

  enableAutosaving: function() {
    this.enable_autosave = true;
  },

  disableAutosaving: function() {
    this.enable_autosave = false;
  },

  /**
   * Loads the given draft information into the editor. This will
   * update the underlying document and render the editor
   * appropriately. This is called on page load as well (from the
   * controller) to load the initial state of the draft)
   */
  loadDraftState: function (title, body) {
    // TODO: Do something with the title
    peernoteNS.doc.setState(body);
    peernoteNS.doc.render();
  },

  /**
   * Saves the draft to the db via ajax. This is called by
   * this.keystroke()
   */
  save: function() {
    var _this = this;

    var state = peernoteNS.doc.getState();

    var params = {
      uid: peernoteNS.essays.uid,
      did: peernoteNS.essays.did,
      body: JSON.stringify(state)
    };

    $status_line = $('.status-line');
    $status_line.text('Saving…');
    $status_line.css('opacity', '1.0');
    $.post('/api/save_draft', params, function(data) {
      if (data.status == "success") {
        $status_line.text('Saved');
        peernoteNS.essays.lastModifiedDate = data.timestamp;
      }
    });
  },

  /* Event listener for handling autosaving.
   */
  onDocumentChange: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.editor;
    if (!_this.enable_autosave) {
        return;
    }

    if (_this.autosave_timer) {
      clearTimeout(_this.autosave_timer);
      _this.autosave_timer = null;
    }

    // Remove the saved text, the state has probs changed.
    $('.status-line').text('');

    _this.autosave_timer = setTimeout(function() {
      _this.save();
      _this.autosave_timer = null;
    }, _this.AUTOSAVE_PAUSE_MILLIS);
  }),

  setupBlockTypes: function() {
    this.BLOCK_TYPES.push(peernoteNS.containerBlock);
    this.BLOCK_TYPES.push(peernoteNS.textBlock);
  },

  initDocument: function() {
    var docContainer = $('.page-container .page')[0];
    this._doc = docContainer;
    peernoteNS.doc.init();
    peernoteNS.doc.render();
    $(docContainer).keypress(peernoteNS.editor.keypress);
    peernoteNS.essays.keys.registerDownHandler(peernoteNS.essays.keys.BACKSPACE,
                                               peernoteNS.editor.backspaceHandler);
    // Subscribe to changes in the document so that we can
    // autosave appropriately.
    peernoteNS.doc.addChangeListener(this.onDocumentChange);
  },

  initToolbar: function() {
    var toolbar = $('.toolbar');
    var toolkitLeft = $('.toolkit-left');
    toolkitLeft.find('button.bold').click(peernoteNS.editor.bold);
    toolkitLeft.find('button.italic').click(peernoteNS.editor.italic);
    toolkitLeft.find('button.underline').click(peernoteNS.editor.underline);
    toolkitLeft.find('button.left-align').click(peernoteNS.editor.leftAlign);
    toolkitLeft.find('button.right-align').click(peernoteNS.editor.rightAlign);
    toolkitLeft.find('button.center-align').click(peernoteNS.editor.centerAlign);
    toolbar.find('button#undo').click(peernoteNS.editor.undo);
    toolbar.find('button#redo').click(peernoteNS.editor.redo);
  }

});

peernoteNS.init(function() {
  peernoteNS.editor.setupBlockTypes();
  peernoteNS.editor.initDocument();
  peernoteNS.editor.initToolbar();
});
