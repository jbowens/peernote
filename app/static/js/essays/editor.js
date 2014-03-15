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
      var sel = _this._getSel();
      if (sel.isSelection) {
        var modifiers = peernoteNS.doc.getModifiers(sel.start);
        var isApply = $.inArray(modifierType, modifiers) == -1;
        var apply = function() {
          peernoteNS.doc.applyModifier(modifierType, sel.start, sel.end);
          peernoteNS.doc.render();
        };
        var unapply = function() {
          peernoteNS.doc.removeModifier(modifierType, sel.start, sel.end);
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
        var pendingIndex = $.inArray(modifierType, _this._pendingModifiers);
        if (pendingIndex == -1) {
          _this._pendingModifiers.push(modifierType);
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

  _pendingModifiers: [],

  _doc: null,

  _getSel: function() {
    var sel = peernoteNS.docutils.getCaretPosition(peernoteNS.editor._doc);
    return sel;
  },

  /* Keypress handler for the editor. This function handles everything that
   * should happen on key press in the editor.
   */
  keypress: peernoteNS.errors.wrap(function(e) {
    var _this = peernoteNS.editor;
    // Did the document change?
    if (peernoteNS.doc.getText() != _this._doc.innerText) {
      var charDiff = _this._doc.innerText.length - peernoteNS.doc._text.length;
      var pos = peernoteNS.docutils.getCaretPosition(_this._doc);
      // Update the stored representation of the document.
      peernoteNS.doc.updateDocument(_this._doc.innerText,
                                    pos.start - charDiff,
                                    charDiff);
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

  initDocument: function() {
    var docContainer = $('.page-container .page')[0];
    this._doc = docContainer;
    peernoteNS.doc._text = docContainer.innerText;
    peernoteNS.doc.render();
    $(docContainer).keyup(peernoteNS.editor.keypress);
  },

  initToolbar: function() {
    var toolbar = $('.toolbar');
    toolbar.find('button.bold').click(peernoteNS.editor.bold);
    toolbar.find('button.italic').click(peernoteNS.editor.italic);
    toolbar.find('button.underline').click(peernoteNS.editor.underline);
    toolbar.find('button#undo').click(peernoteNS.editor.undo);
    toolbar.find('button#redo').click(peernoteNS.editor.redo);
  }
});

peernoteNS.init(function() {
  peernoteNS.editor.initDocument();
  peernoteNS.editor.initToolbar();
});
