function isInstanceOfNode(node) {
  // we changed the name because of having duplicate module provider (fbjs)
  if (!node || !node.ownerDocument) {
    return false;
  }
  if (!node.ownerDocument.defaultView) {
    return node instanceof Node;
  }
  if (node instanceof node.ownerDocument.defaultView.Node) {
    return true;
  }
  return false;
}

module.exports = isInstanceOfNode;
