function isElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }
  if (!node.ownerDocument.defaultView) {
    return node instanceof Element;
  }
  if (node instanceof node.ownerDocument.defaultView.Element) {
    return true;
  }
  return false;
}

module.exports = isElement;
