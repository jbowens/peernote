/*
 * Editor related logic. Listeners for editor buttons, etc. live here.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.editor = peernoteNS.editor || {};
$.extend(peernoteNS.editor, {

  _doc: null,

  _getSel: function() {
    var sel = peernoteNS.docutils.getCaretPosition(peernoteNS.editor._doc);
    return sel;
  },
  
  bold: function(e) {
    var sel = peernoteNS.editor._getSel();
    peernoteNS.doc.applyModifier('bold', sel.start, sel.end);
    peernoteNS.doc.render();
  },

  italic: function(e) {
    var sel = peernoteNS.editor._getSel();
    peernoteNS.doc.applyModifier('italic', sel.start, sel.end);
    peernoteNS.doc.render();
  },

  underline: function(e) {
    var sel = peernoteNS.editor._getSel();
    peernoteNS.doc.applyModifier('underline', sel.start, sel.end);
    peernoteNS.doc.render();
  },

  initDocument: function() {
    var docContainer = $('.page-container .page')[0];
    this._doc = docContainer;
    peernoteNS.doc._text = docContainer.innerText;
    peernoteNS.doc.render();
  },

  initToolbar: function() {
    var toolbar = $('.toolbar');
    // TODO: Setup error reporting for handlers
    toolbar.find('.fa-bold').click(peernoteNS.editor.bold);
    toolbar.find('.fa-italic').click(peernoteNS.editor.italic);
    toolbar.find('.fa-underline').click(peernoteNS.editor.underline);
  }
});

peernoteNS.init(function() {
  peernoteNS.editor.initDocument();
  peernoteNS.editor.initToolbar();
});
