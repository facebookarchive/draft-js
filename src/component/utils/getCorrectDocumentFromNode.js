function getCorrectDocumentFromNode(node) {
  if (!node || !node.ownerDocument) {
    return document;
  }
  return node.ownerDocument;
}

module.exports = getCorrectDocumentFromNode;
