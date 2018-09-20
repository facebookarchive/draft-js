function isNode(node) {
  if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) {
    return false;
  }
  return node instanceof node.ownerDocument.defaultView.Node;
}

module.exports = isNode;
