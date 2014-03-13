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

  /* Finds all elements in the text offset range.
   *
   * @param doc the document to search in
   * @param start  start offset
   * @param eend  end offset
   * @return a list of elements in the range
   */
  getRange: function(doc, start, end) {
    // Nodes within the region.
    var nodes = [];

    var offset = 0;
    var toVisit = [doc];
    var found = false;
    while (toVisit.length > 0) {
      var curr = toVisit.pop();
      var s = offset;
      var e = s + (curr.nodeType == 3 ? curr.length : curr.innerText.length);

      if (curr.nodeType == 3) {
        if (!(e < start || s > end)) {
          nodes.push(curr);
        }
        // This is a text node. Just add its characters.
        offset += curr.length;
      } else {
        if (s >= start && e <= end) {
          // This element is completely contained within the range.
          nodes.push(curr);
        }
        else {
          // This is an element. We should descend into its children.
          // Push them in the opposite order so that the first child is
          // the first thing on the stack.
          for (var i = curr.childNodes.length - 1; i >= 0; --i) {
            toVisit.push(curr.childNodes[i]);
          }
        }
      }
    }

    var startPos = this.getNodeAtOffset(doc, start);
    var endPos = this.getNodeAtOffset(doc, end);
    return {
      nodes: nodes,
      startOffset: startPos.nodeOffset, 
      endOffset: endPos.nodeOffset
    };
  },

  /* Retrieves the current position of the caret (or selection)
   * in terms of plain text offset. Returns an object with information
   * including whether it's a selection or not, and offsets.
   *
   * @param doc  the document to find the selection position within.
   * @return an object with start and end positions, or false if the
   *         focus is not currently on the document.
   */
  getCaretPosition: function(doc) {
    var s = document.getSelection();
    var pos = {
      isSelection: s.anchorNode != s.focusNode || s.anchorOffset != s.focusOffset,
      start: this.getOffset(doc, s.anchorNode, s.anchorOffset),
      end: this.getOffset(doc, s.focusNode, s.focusOffset)
    };

    if (pos.start === false && pos.end === false) {
      // The selection is not even within the document.
      return false;
    }

    pos.text = pos.isSelection ? s.toString() : '';

    return pos;
  },

  /* Traverses the document, finding the node at the given plain
   * text offset. This function is the inverse of docutils.getOffset().
   * It will return resulting node and nodeOffset in an object, or
   * return false if the document isn't long enough for textOffset.
   *
   * @param doc  the document to search within
   * @param textOffset  the text offset to search for
   * @return an object with 'node' and 'nodeOffset' members, or
   *         false if textOffset is longer than the document.
   */
  getNodeAtOffset: function(doc, textOffset) {
    var target = null;
    var toVisit = [doc];
    while (toVisit.length > 0) {
      var curr = toVisit.pop();
      if (curr.nodeType == 3) {
        var len = curr.nodeValue.length;
        if (textOffset > len) {
          // The node we're looking for is later than this.
          textOffset -= len;
        } else {
          // This is the node we're looking for.
          target = curr;
          break;
        }
      } else {
        // This is an element. We should descend into its children.
        for (var i = curr.childNodes.length - 1; i >= 0; --i) {
          toVisit.push(curr.childNodes[i]);
        }
      }
    }

    return target ? {node: target, nodeOffset: textOffset} : false;
  },

  /* Calculates the text offset of an offset within a node. This is useful
   * for converting cursor positions to text offsets.
   *
   * @param doc the parent doc DOM element
   * @param node the node to calculate the offset of
   * @param nodeOffset the offset within the given node
   *
   * @return the text offset of the given node offset position, or false
   *         if the node was never found.
   */
  getOffset: function(doc, node, nodeOffset) {
    var offset = 0;

    // Do a depth first search on the document, counting text
    // characters as we go.
    var toVisit = [doc];
    var found = false;
    while (toVisit.length > 0) {
      var curr = toVisit.pop();

      if (curr == node) {
        // We found the node we were looking for. Break out.
        found = true;
        break;
      }

      if (curr.nodeType == 3) {
        // This is a text node. Just add its characters.
        offset += curr.nodeValue.length;
      } else {
        // This is an element. We should descend into its children.
        // Push them in the opposite order so that the first child is
        // the first thing on the stack.
        for (var i = curr.childNodes.length - 1; i >= 0; --i) {
          toVisit.push(curr.childNodes[i]);
        }
      }
    }
  
    return found ? offset + nodeOffset : false;
  },

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
