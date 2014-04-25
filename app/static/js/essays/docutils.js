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

  ZERO_WIDTH_SPACE: String.fromCharCode(parseInt('200B', 16)),

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
        if (curr.nodeValue.indexOf(this.ZERO_WIDTH_SPACE) != -1) {
          len--;
        }
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

    var zwspIdx = node.nodeValue.indexOf(this.ZERO_WIDTH_SPACE);
    if (zwspIdx != -1 && nodeOffset > zwspIdx) {
      --nodeOffset;
    }

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
        if (curr.nodeValue.indexOf(this.ZERO_WIDTH_SPACE) != -1) {
          offset += curr.nodeValue.length - 1;
        } else {
          offset += curr.nodeValue.length;
        }
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

  /* If the given node contains a zero-width space, this function
   * returns nodeOffset - 1. Otherwise, it returns nodeOffset.
   */
  actualOffset: function(node, nodeOffset) {
    if (node && node.nodeValue && node.nodeValue.indexOf(this.ZERO_WIDTH_SPACE)) {
      return nodeOffset - 1;
    } else {
      return nodeOffset;
    }
  },

  /* Splits the textnode at the firstOffset. If the second offset is provided,
   * the node will also be split on the second offset.
   */
  _splitTextNode: function(textNode, firstOffset, secondOffset) {
    var leadingNode, middleNode, trailingNode;
    var rawTxt = textNode.nodeValue;

    if (firstOffset > 0) {
      // If the first offset is 0, there's no need to create a leading
      // text node. If it's > 0, we should make a node with the leading text.
      leadingNode = document.createTextNode(rawTxt.substr(0, firstOffset));
    }

    if (secondOffset && secondOffset > rawTxt.length) {
      // There's a second offset and trailing text after it. We should
      // make a text node with the trailing text.
      trailingNode = document.createTextNode(rawTxt.substr(secondOffset));
    }

    var middleNode = document.createTextNode(rawTxt.substr(firstOffset, secondOffset));
    return {'leading': leadingNode, 'middle': middleNode, 'trailing': trailingNode};
  },

  /* Returns all the text nodes in the given subtree.
   */
  _getTextNodes: function(node) {
    var textNodes = [];
    var toVisit = [node];
    while (toVisit.length) {
      var n = toVisit.pop();
      if (n.nodeType == 3) {
        textNodes.push(n);
      } else {
        for (var i = textNodes.length - 1; i >= 0; --i) {
          textNodes.push(n);
        }
      }
    }
    return textNodes;
  }

});
