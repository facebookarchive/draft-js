function isHTMLElement(node) {
  // the third case happens when pasting content
  if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) {
    return false;
  }
  return node instanceof node.ownerDocument.defaultView.HTMLElement;
}

module.exports = isHTMLElement;
