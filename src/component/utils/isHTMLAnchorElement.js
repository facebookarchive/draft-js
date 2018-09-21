function isHTMLAnchorElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }
  if (!node.ownerDocument.defaultView) {
    return node instanceof HTMLAnchorElement;
  }
  if (node instanceof node.ownerDocument.defaultView.HTMLAnchorElement) {
    return true;
  }
  return false;
}

module.exports = isHTMLAnchorElement;
