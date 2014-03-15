/*
 * Editor related logic. Listeners for editor buttons, etc. live here.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.editor = peernoteNS.editor || {};
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
    // Update the document text.
    if (peernoteNS.doc.getText() != peernoteNS.editor._doc.innerText) {
      var charDiff = peernoteNS.editor._doc.innerText.length - peernoteNS.doc._text.length;
      var pos = peernoteNS.docutils.getCaretPosition(peernoteNS.editor._doc);
      peernoteNS.doc.updateDocument(peernoteNS.editor._doc.innerText, pos.start - charDiff, charDiff);
    }
  }),
  
  bold: peernoteNS.errors.wrap(function(e) {
    var sel = peernoteNS.editor._getSel();
    if (sel.isSelection) {
      var isApply = $.inArray('bold', peernoteNS.doc.getModifiers(sel.start)) == -1;
      var apply = function() {
        peernoteNS.doc.applyModifier('bold', sel.start, sel.end);
        peernoteNS.doc.render();
      };
      var unapply = function() {
        peernoteNS.doc.removeModifier('bold', sel.start, sel.end);
        peernoteNS.doc.render();
      };
      var cmd = {
        type: peernoteNS.commands.TYPES.BOLD,
        execute: isApply ? apply : unapply,
        revert: isApply ? unapply : apply
      };
      peernoteNS.commands.execute(cmd);
    } else {
      // TODO: Maybe turn this into an undo-able command.
      if ($.inArray('bold', peernoteNS.editor._pendingModifiers) == -1) {
        peernoteNS.editor._pendingModifiers.push('bold');
      } else {
        peernoteNS.editor._pendingModifiers.splice($.inArray('bold', peernoteNS.editor._pendingModifiers), 1);
      }
    }
  }),

  italic: peernoteNS.errors.wrap(function(e) {
    var sel = peernoteNS.editor._getSel();
    if (sel.isSelection) {
      var isApply = $.inArray('italic', peernoteNS.doc.getModifiers(sel.start)) == -1;
      var apply = function() {
        peernoteNS.doc.applyModifier('italic', sel.start, sel.end);
        peernoteNS.doc.render();
      };
      var unapply = function() {
        peernoteNS.doc.removeModifier('italic', sel.start, sel.end);
        peernoteNS.doc.render();
      };
      var cmd = {
        type: peernoteNS.commands.TYPES.ITALIC,
        execute: isApply ? apply : unapply,
        revert: isApply ? unapply : apply
      };
      peernoteNS.commands.execute(cmd);
    } else {
      // TODO: Maybe turn this into an undo-able command.
      peernoteNS.editor._pendingModifiers.push('italic');
    }
  }),

  underline: peernoteNS.errors.wrap(function(e) {
    var sel = peernoteNS.editor._getSel();
    if (sel.isSelection) {
      var isApply = $.inArray('underline', peernoteNS.doc.getModifiers(sel.start)) == -1;
      var apply = function() {
        peernoteNS.doc.applyModifier('underline', sel.start, sel.end);
        peernoteNS.doc.render();
      };
      var unapply = function() {
        peernoteNS.doc.removeModifier('underline', sel.start, sel.end);
        peernoteNS.doc.render();
      };
      var cmd = {
        type: peernoteNS.commands.TYPES.UNDERLINE,
        execute: isApply ? apply : unapply,
        revert: isApply ? unapply : apply
      };
      peernoteNS.commands.execute(cmd);
    } else {
      // TODO: Maybe turn this into an undo-able command.
      peernoteNS.editor._pendingModifiers.push('underline');
    }
  }),

  undo: peernoteNS.errors.wrap(function(e) {
    peernoteNS.commands.undo();
  }),

  redo: peernoteNS.errors.wrap(function(e) {
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
