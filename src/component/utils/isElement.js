function isElement(node) {
  if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) {
    return false;
  }
  return node instanceof node.ownerDocument.defaultView.Element;
}

module.exports = isElement;
