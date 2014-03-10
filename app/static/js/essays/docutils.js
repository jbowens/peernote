/*
 * Document utility methods that are used in the editor and
 * reviewer. It provides a layer of abstraction and handles
 * common document manipulation tasks.
 *
 * God forbid us for this code.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.docutils = peernoteNS.docutils || {};
$.extend(peernoteNS.docutils, {

  /* This function will insert plain text into the document at
   * the current cursor location. If the user currently has a
   * selection, then the selection will be replaced with the
   * provided text, and the cursor will be set to right after the
   * newly inserted text.
   *
   * @param text  the text to insert into the document.
   */
  insertRawTextAtCursor: function(text) {
    // Grab the current selection to determine where the cursor is.
    var s = window.getSelection();
    var node = s.extentNode;
    var offset = s.extentOffset;

    if (s.type == "Range") {
      // The user has text selected. We should replace the selected text
      // with the given parameter.
      var sNode = s.baseNode;
      var sOffset = s.baseOffset;
      s.deleteFromDocument();
      this._addToNodeAtOffset(sNode, text, sOffset);
      s.removeAllRanges();
      var range = document.createRange();
      range.setStart(sNode, sOffset + text.length);
      s.addRange(range);
    } else {
      // The user just has a caret in a specific location. We should insert
      // into the document and mantain the caret location.
      this._addToNodeAtOffset(node, text, offset);
      
      // As soon as we've fucked with the nodes, we're going to lose our
      // selection. We need to restore the selection.
      s.removeAllRanges();
      var range = document.createRange();
      range.setStart(node, offset + text.length);
      s.addRange(range);
    }
  },

  _addToNodeAtOffset: function(node, text, offset) {
    if (node.nodeType == 3) {
      // It's a text node.
      var currText = node.nodeValue;
      var newText = currText.substr(0, offset);
      newText += text;
      newText += currText.substr(offset);
      node.nodeValue = newText;
    } else {
        // The caret is on an element, not a text node. We should insert the
        // text into the element as a new text node at the beginning.
        var newTextNode = document.createTextNode(text);
        if (node.childNodes.length) {
          // The element already has children. Insert the text node before any
          // existing children.
          node.insertBefore(newTextNode, node.firstChild);
        } else {
          // The element is empty. Just append the text node.
          node.appendChild(newTextNode);
        }
    }
  }

});
