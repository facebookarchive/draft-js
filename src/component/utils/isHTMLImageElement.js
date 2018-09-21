function isHTMLImageElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }
  if (!node.ownerDocument.defaultView) {
    return node instanceof HTMLImageElement;
  }
  if (node instanceof node.ownerDocument.defaultView.HTMLImageElement) {
    return true;
  }
  return false;
}

module.exports = isHTMLImageElement;
