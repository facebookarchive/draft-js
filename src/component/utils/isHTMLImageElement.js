function isHTMLImageElement(node) {
  if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) {
    return false;
  }
  return node instanceof node.ownerDocument.defaultView.HTMLImageElement;
}

module.exports = isHTMLImageElement;
