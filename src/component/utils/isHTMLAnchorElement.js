function isHTMLAnchorElement(node) {
  if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) {
    return false;
  }
  return node instanceof node.ownerDocument.defaultView.HTMLAnchorElement;
}

module.exports = isHTMLAnchorElement;
