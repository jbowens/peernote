/*
 * Editor related logic. Listeners for editor buttons, etc. live here.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.editor = peernoteNS.editor || {};

/* We declare _simpleModifierToggler first so that it may be used when
 * initializing other peernoteNS.editor properties.
 */
$.extend(peernoteNS.editor, {
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

  _doc: null,

  keypress: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.editor;
    if (e.keyCode == 13) {
      // They hit enter. We should create a new block.
      e.preventDefault();
      peernoteNS.doc.createNewBlock();
    }
  }),

  keydown: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.editor;
    if (e.keyCode == 8) {
      // They hit backspace. We should delete a character.
      e.preventDefault();
      peernoteNS.doc.deleteAtCaret();
    }
  }),

  /* Togglers for simple modifiers. These are installed as listeners for
   * their corrsesponding UI elements.
   */
  bold: peernoteNS.editor._simpleModifierToggler('bold',
      peernoteNS.commands.TYPES.BOLD),

  italic: peernoteNS.editor._simpleModifierToggler('italic',
      peernoteNS.commands.TYPES.ITALIC),

  underline: peernoteNS.editor._simpleModifierToggler('underline',
      peernoteNS.commands.TYPES.UNDERLINE),

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
  loadDraftState: function (title) {
    // TODO: Update with actual new draft state
    // If we're loading something into the editor, it must be
    // the finalized draft.
  },

  /**
   * Saves the draft to the db via ajax. This is called by
   * this.keystroke()
   */
  save: function() {
    var _this = this;

    // TODO: Handle the title.
    var state = peernoteNS.doc.getState();

    var params = {
      text: state.text,
      uid: peernoteNS.essays.uid,
      did: peernoteNS.essays.did,
      modifiers: JSON.stringify(state.modifiers)
    };

    $status_line = $('.status-line');
    $status_line.text('Saving…');
    $status_line.css('opacity', '1.0');
    /*
     * TODO: Handle saving drafts.
    $.post('/api/save_draft', params, function(data) {
      if (data.status == "success") {
        $status_line.text('Saved');
        peernoteNS.essays.lastModifiedDate = data.timestamp;
      }
    });
    */
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

  initDocument: function() {
    var docContainer = $('.page-container .page')[0];
    this._doc = docContainer;
    peernoteNS.doc.init();
    peernoteNS.doc.render();
    $(docContainer).keypress(peernoteNS.editor.keypress);
    $(docContainer).keydown(peernoteNS.editor.keydown);
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
    toolbar.find('button#undo').click(peernoteNS.editor.undo);
    toolbar.find('button#redo').click(peernoteNS.editor.redo);
  }

});

peernoteNS.init(function() {
  peernoteNS.editor.initDocument();
  peernoteNS.editor.initToolbar();
});
