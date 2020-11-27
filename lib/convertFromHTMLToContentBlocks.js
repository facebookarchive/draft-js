/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var _knownListItemDepthCl;

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CharacterMetadata = require("./CharacterMetadata");

var ContentBlock = require("./ContentBlock");

var ContentBlockNode = require("./ContentBlockNode");

var ContentState = require("./ContentState");

var DefaultDraftBlockRenderMap = require("./DefaultDraftBlockRenderMap");

var URI = require("fbjs/lib/URI");

var cx = require("fbjs/lib/cx");

var generateRandomKey = require("./generateRandomKey");

var getSafeBodyFromHTML = require("./getSafeBodyFromHTML");

var gkx = require("./gkx");

var _require = require("immutable"),
    List = _require.List,
    Map = _require.Map,
    OrderedSet = _require.OrderedSet;

var isHTMLAnchorElement = require("./isHTMLAnchorElement");

var isHTMLBRElement = require("./isHTMLBRElement");

var isHTMLElement = require("./isHTMLElement");

var isHTMLImageElement = require("./isHTMLImageElement");

var convertToRaw = require("./convertFromDraftStateToRaw");

var EditorState = require("./EditorState");

var experimentalTreeDataSupport = gkx('draft_tree_data_support');
var NBSP = '&nbsp;';
var SPACE = ' '; // used for replacing characters in HTML

var REGEX_CR = new RegExp('\r', 'g');
var REGEX_LF = new RegExp('\n', 'g');
var REGEX_LEADING_LF = new RegExp('^\n', 'g');
var REGEX_NBSP = new RegExp(NBSP, 'g');
var REGEX_CARRIAGE = new RegExp('&#13;?', 'g');
var REGEX_ZWS = new RegExp('&#8203;?', 'g'); // https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight

var boldValues = ['bold', 'bolder', '500', '600', '700', '800', '900'];
var notBoldValues = ['light', 'lighter', 'normal', '100', '200', '300', '400'];
var anchorAttr = ['className', 'href', 'rel', 'target', 'title'];
var imgAttr = ['alt', 'className', 'height', 'src', 'width'];
var fileAttr = ['type', 'objectkey', 'bucketname', 'name', 'size'];
var knownListItemDepthClasses = (_knownListItemDepthCl = {}, _defineProperty(_knownListItemDepthCl, cx('public/DraftStyleDefault/depth0'), 0), _defineProperty(_knownListItemDepthCl, cx('public/DraftStyleDefault/depth1'), 1), _defineProperty(_knownListItemDepthCl, cx('public/DraftStyleDefault/depth2'), 2), _defineProperty(_knownListItemDepthCl, cx('public/DraftStyleDefault/depth3'), 3), _defineProperty(_knownListItemDepthCl, cx('public/DraftStyleDefault/depth4'), 4), _knownListItemDepthCl);
var HTMLTagToRawInlineStyleMap = Map({
  b: 'BOLD',
  code: 'CODE',
  del: 'STRIKETHROUGH',
  em: 'ITALIC',
  i: 'ITALIC',
  s: 'STRIKETHROUGH',
  strike: 'STRIKETHROUGH',
  strong: 'BOLD',
  u: 'UNDERLINE',
  mark: 'HIGHLIGHT'
});

/**
 * Build a mapping from HTML tags to draftjs block types
 * out of a BlockRenderMap.
 *
 * The BlockTypeMap for the default BlockRenderMap looks like this:
 *   Map({
 *     h1: 'header-one',
 *     h2: 'header-two',
 *     h3: 'header-three',
 *     h4: 'header-four',
 *     h5: 'header-five',
 *     h6: 'header-six',
 *     blockquote: 'blockquote',
 *     figure: 'atomic',
 *     pre: ['code-block'],
 *     div: 'unstyled',
 *     p: 'unstyled',
 *     li: ['ordered-list-item', 'unordered-list-item'],
 *   })
 */
var buildBlockTypeMap = function buildBlockTypeMap(blockRenderMap) {
  var blockTypeMap = {};
  blockRenderMap.mapKeys(function (blockType, desc) {
    var elements = [desc.element];

    if (desc.aliasedElements !== undefined) {
      elements.push.apply(elements, desc.aliasedElements);
    }

    elements.forEach(function (element) {
      if (blockTypeMap[element] === undefined) {
        blockTypeMap[element] = blockType;
      } else if (typeof blockTypeMap[element] === 'string') {
        blockTypeMap[element] = [blockTypeMap[element], blockType];
      } else {
        blockTypeMap[element].push(blockType);
      }
    });
  });
  return Map(blockTypeMap);
};

var detectInlineStyle = function detectInlineStyle(node) {
  if (isHTMLElement(node)) {
    var element = node; // Currently only used to detect preformatted inline code

    if (element.style.fontFamily.includes('monospace')) {
      return 'CODE';
    }
  }

  return null;
};
/**
 * If we're pasting from one DraftEditor to another we can check to see if
 * existing list item depth classes are being used and preserve this style
 */


var getListItemDepth = function getListItemDepth(node) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  Object.keys(knownListItemDepthClasses).some(function (depthClass) {
    if (node.classList.contains(depthClass)) {
      depth = knownListItemDepthClasses[depthClass];
    }
  });
  return depth;
};
/**
 * Return true if the provided HTML Element can be used to build a
 * Draftjs-compatible link.
 */


var isValidAnchor = function isValidAnchor(node) {
  if (!isHTMLAnchorElement(node)) {
    return false;
  }

  var anchorNode = node;

  if (!anchorNode.href || anchorNode.protocol !== 'http:' && anchorNode.protocol !== 'https:' && anchorNode.protocol !== 'mailto:' && anchorNode.protocol !== 'tel:') {
    return false;
  }

  try {
    // Just checking whether we can actually create a URI
    var _ = new URI(anchorNode.href);

    return true;
  } catch (_unused) {
    return false;
  }
};
/**
 * Return true if the provided HTML Element can be used to build a
 * Draftjs-compatible image.
 */


var isValidImage = function isValidImage(node) {
  if (!isHTMLImageElement(node)) {
    return false;
  }

  var imageNode = node;
  return !!(imageNode.attributes.getNamedItem('src') && imageNode.attributes.getNamedItem('src').value);
};

function isElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }

  return node.nodeType === Node.ELEMENT_NODE;
}

function isHTMLFileElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }

  return isElement(node) && node.title === 'file-entity';
}

function isHTMLTableElement(node) {
  if (!node || !node.ownerDocument) {
    return false;
  }

  return isElement(node) && node.tagName === 'TABLE';
}
/**
 * Return true if the provided HTML Element can be used to build a
 * Draftjs-compatible file.
 */


var isValidFile = function isValidFile(node) {
  if (!isHTMLTableElement(node)) {
    return false;
  }

  var fileNode = node;
  return !!(fileNode.dataset.bucketname && fileNode.dataset.objectkey);
};

var isValidTable = function isValidTable(node) {
  if (!isHTMLTableElement(node)) {
    return false;
  }

  return true;
};
/**
 * Try to guess the inline style of an HTML element based on its css
 * styles (font-weight, font-style and text-decoration).
 */


var styleFromNodeAttributes = function styleFromNodeAttributes(node, style) {
  if (!isHTMLElement(node)) {
    return style;
  }

  var htmlElement = node;
  var fontWeight = htmlElement.style.fontWeight;
  var fontStyle = htmlElement.style.fontStyle;
  var textDecoration = htmlElement.style.textDecoration;
  return style.withMutations(function (style) {
    if (boldValues.indexOf(fontWeight) >= 0) {
      style.add('BOLD');
    } else if (notBoldValues.indexOf(fontWeight) >= 0) {
      style.remove('BOLD');
    }

    if (fontStyle === 'italic') {
      style.add('ITALIC');
    } else if (fontStyle === 'normal') {
      style.remove('ITALIC');
    }

    if (textDecoration === 'underline') {
      style.add('UNDERLINE');
    }

    if (textDecoration === 'line-through') {
      style.add('STRIKETHROUGH');
    }

    if (textDecoration === 'none') {
      style.remove('UNDERLINE');
      style.remove('STRIKETHROUGH');
    }
  });
};
/**
 * Determine if a nodeName is a list type, 'ul' or 'ol'
 */


var isListNode = function isListNode(nodeName) {
  return nodeName === 'ul' || nodeName === 'ol';
};
/**
 *  ContentBlockConfig is a mutable data structure that holds all
 *  the information required to build a ContentBlock and an array of
 *  all the child nodes (childConfigs).
 *  It is being used a temporary data structure by the
 *  ContentBlocksBuilder class.
 */


/**
 * ContentBlocksBuilder builds a list of ContentBlocks and an Entity Map
 * out of one (or several) HTMLElement(s).
 *
 * The algorithm has two passes: first it builds a tree of ContentBlockConfigs
 * by walking through the HTML nodes and their children, then it walks the
 * ContentBlockConfigs tree to compute parents/siblings and create
 * the actual ContentBlocks.
 *
 * Typical usage is:
 *     new ContentBlocksBuilder()
 *        .addDOMNode(someHTMLNode)
 *        .addDOMNode(someOtherHTMLNode)
 *       .getContentBlocks();
 *
 */
var ContentBlocksBuilder = /*#__PURE__*/function () {
  // Most of the method in the class depend on the state of the content builder
  // (i.e. currentBlockType, currentDepth, currentEntity etc.). Though it may
  // be confusing at first, it made the code simpler than the alternative which
  // is to pass those values around in every call.
  // The following attributes are used to accumulate text and styles
  // as we are walking the HTML node tree.
  // Describes the future ContentState as a tree of content blocks
  // The content blocks generated from the blockConfigs
  // Entity map use to store links and images found in the HTML nodes
  // Map HTML tags to draftjs block types and disambiguation function
  function ContentBlocksBuilder(blockTypeMap, disambiguate) {
    _defineProperty(this, "characterList", List());

    _defineProperty(this, "currentBlockType", 'unstyled');

    _defineProperty(this, "currentDepth", 0);

    _defineProperty(this, "currentEntity", null);

    _defineProperty(this, "currentText", '');

    _defineProperty(this, "wrapper", null);

    _defineProperty(this, "blockConfigs", []);

    _defineProperty(this, "contentBlocks", []);

    _defineProperty(this, "contentState", ContentState.createFromText(''));

    _defineProperty(this, "blockTypeMap", void 0);

    _defineProperty(this, "disambiguate", void 0);

    this.clear();
    this.blockTypeMap = blockTypeMap;
    this.disambiguate = disambiguate;
  }
  /**
   * Clear the internal state of the ContentBlocksBuilder
   */


  var _proto = ContentBlocksBuilder.prototype;

  _proto.clear = function clear() {
    this.characterList = List();
    this.blockConfigs = [];
    this.currentBlockType = 'unstyled';
    this.currentDepth = 0;
    this.currentEntity = null;
    this.currentText = '';
    this.contentState = ContentState.createFromText('');
    this.wrapper = null;
    this.contentBlocks = [];
  }
  /**
   * Add an HTMLElement to the ContentBlocksBuilder
   */
  ;

  _proto.addDOMNode = function addDOMNode(node) {
    var _this$blockConfigs;

    this.contentBlocks = [];
    this.currentDepth = 0; // Converts the HTML node to block config

    (_this$blockConfigs = this.blockConfigs).push.apply(_this$blockConfigs, this._toBlockConfigs([node], OrderedSet())); // There might be some left over text in the builder's
    // internal state, if so make a ContentBlock out of it.


    this._trimCurrentText();

    if (this.currentText !== '') {
      this.blockConfigs.push(this._makeBlockConfig());
    } // for chaining


    return this;
  }
  /**
   * Return the ContentBlocks and the EntityMap that corresponds
   * to the previously added HTML nodes.
   */
  ;

  _proto.getContentBlocks = function getContentBlocks() {
    if (this.contentBlocks.length === 0) {
      if (experimentalTreeDataSupport) {
        this._toContentBlocks(this.blockConfigs);
      } else {
        this._toFlatContentBlocks(this.blockConfigs);
      }
    }

    return {
      contentBlocks: this.contentBlocks,
      entityMap: this.contentState.getEntityMap()
    };
  } // ***********************************WARNING******************************
  // The methods below this line are private - don't call them directly.

  /**
   * Generate a new ContentBlockConfig out of the current internal state
   * of the builder, then clears the internal state.
   */
  ;

  _proto._makeBlockConfig = function _makeBlockConfig() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var key = config.key || generateRandomKey();

    var block = _objectSpread({
      key: key,
      type: this.currentBlockType,
      text: this.currentText,
      characterList: this.characterList,
      depth: this.currentDepth,
      parent: null,
      children: List(),
      prevSibling: null,
      nextSibling: null,
      childConfigs: []
    }, config);

    this.characterList = List();
    this.currentBlockType = 'unstyled';
    this.currentText = '';
    return block;
  }
  /**
   * Converts an array of HTML elements to a multi-root tree of content
   * block configs. Some text content may be left in the builders internal
   * state to enable chaining sucessive calls.
   */
  ;

  _proto._toBlockConfigs = function _toBlockConfigs(nodes, style) {
    var blockConfigs = [];

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var nodeName = node.nodeName.toLowerCase();

      if (nodeName === 'body' || isListNode(nodeName)) {
        // body, ol and ul are 'block' type nodes so create a block config
        // with the text accumulated so far (if any)
        this._trimCurrentText();

        if (this.currentText !== '') {
          blockConfigs.push(this._makeBlockConfig());
        } // body, ol and ul nodes are ignored, but their children are inlined in
        // the parent block config.


        var wasCurrentDepth = this.currentDepth;
        var wasWrapper = this.wrapper;

        if (isListNode(nodeName)) {
          this.wrapper = nodeName;

          if (isListNode(wasWrapper)) {
            this.currentDepth++;
          }
        }

        blockConfigs.push.apply(blockConfigs, this._toBlockConfigs(Array.from(node.childNodes), style));
        this.currentDepth = wasCurrentDepth;
        this.wrapper = wasWrapper;
        continue;
      }

      var blockType = this.blockTypeMap.get(nodeName); // 图片、分割线、表格都拷贝失败，在这里过滤掉 
      // - 此处不需要再过滤
      // if (blockType === 'atomic') {
      //   continue;
      // }

      if (blockType !== undefined) {
        // 'block' type node means we need to create a block config
        // with the text accumulated so far (if any)
        this._trimCurrentText();

        if (this.currentText !== '') {
          blockConfigs.push(this._makeBlockConfig());
        }

        var _wasCurrentDepth = this.currentDepth;
        var _wasWrapper = this.wrapper;
        this.wrapper = nodeName === 'pre' ? 'pre' : this.wrapper;

        if (typeof blockType !== 'string') {
          blockType = this.disambiguate(nodeName, this.wrapper, node) || blockType[0] || 'unstyled';
        }

        if (!experimentalTreeDataSupport && isHTMLElement(node) && (blockType === 'unordered-list-item' || blockType === 'ordered-list-item')) {
          var htmlElement = node;
          this.currentDepth = getListItemDepth(htmlElement, this.currentDepth);
        }

        var key = generateRandomKey();

        var childConfigs = this._toBlockConfigs(Array.from(node.childNodes), style);

        this._trimCurrentText();

        blockConfigs.push(this._makeBlockConfig({
          key: key,
          childConfigs: childConfigs,
          type: blockType
        }));
        this.currentDepth = _wasCurrentDepth;
        this.wrapper = _wasWrapper;
        continue;
      }

      if (nodeName === '#text') {
        this._addTextNode(node, style);

        continue;
      }

      if (nodeName === 'br') {
        this._addBreakNode(node, style);

        continue;
      }

      if (isValidFile(node)) {
        this._addFileNode(node, style);

        continue;
      }

      if (isValidTable(node)) {
        this._addTableNode(node, style);

        continue;
      }

      if (isValidImage(node)) {
        this._addImgNode(node, style);

        continue;
      }

      if (isValidAnchor(node)) {
        this._addAnchorNode(node, blockConfigs, style);

        continue;
      }

      var newStyle = style;

      if (HTMLTagToRawInlineStyleMap.has(nodeName)) {
        newStyle = newStyle.add(HTMLTagToRawInlineStyleMap.get(nodeName));
      }

      newStyle = styleFromNodeAttributes(node, newStyle);
      var inlineStyle = detectInlineStyle(node);

      if (inlineStyle != null) {
        newStyle = newStyle.add(inlineStyle);
      }

      blockConfigs.push.apply(blockConfigs, this._toBlockConfigs(Array.from(node.childNodes), newStyle));
    }

    return blockConfigs;
  }
  /**
   * Append a string of text to the internal buffer.
   */
  ;

  _proto._appendText = function _appendText(text, style) {
    var _this$characterList;

    this.currentText += text;
    var characterMetadata = CharacterMetadata.create({
      style: style,
      entity: this.currentEntity
    });
    this.characterList = (_this$characterList = this.characterList).push.apply(_this$characterList, Array(text.length).fill(characterMetadata));
  }
  /**
   * Trim the text in the internal buffer.
   */
  ;

  _proto._trimCurrentText = function _trimCurrentText() {
    var l = this.currentText.length;
    var begin = l - this.currentText.trimLeft().length;
    var end = this.currentText.trimRight().length; // We should not trim whitespaces for which an entity is defined.

    var entity = this.characterList.findEntry(function (characterMetadata) {
      return characterMetadata.getEntity() !== null;
    });
    begin = entity !== undefined ? Math.min(begin, entity[0]) : begin;
    entity = this.characterList.reverse().findEntry(function (characterMetadata) {
      return characterMetadata.getEntity() !== null;
    });
    end = entity !== undefined ? Math.max(end, l - entity[0]) : end;

    if (begin > end) {
      this.currentText = '';
      this.characterList = List();
    } else {
      this.currentText = this.currentText.slice(begin, end);
      this.characterList = this.characterList.slice(begin, end);
    }
  }
  /**
   * Add the content of an HTML text node to the internal state
   */
  ;

  _proto._addTextNode = function _addTextNode(node, style) {
    var text = node.textContent;
    var trimmedText = text.trim(); // If we are not in a pre block and the trimmed content is empty,
    // normalize to a single space.

    if (trimmedText === '' && this.wrapper !== 'pre') {
      text = ' ';
    }

    if (this.wrapper !== 'pre') {
      // Trim leading line feed, which is invisible in HTML
      text = text.replace(REGEX_LEADING_LF, ''); // Can't use empty string because MSWord

      text = text.replace(REGEX_LF, SPACE);
    }

    this._appendText(text, style);
  };

  _proto._addBreakNode = function _addBreakNode(node, style) {
    if (!isHTMLBRElement(node)) {
      return;
    }

    this._appendText('\n', style);
  }
  /**
   * Add the content of an HTML img node to the internal state
   */
  ;

  _proto._addImgNode = function _addImgNode(node, style) {
    if (!isHTMLImageElement(node)) {
      return;
    }

    var image = node;
    var entityConfig = {};
    var entityAttrMap = {
      'src': 'url'
    };
    imgAttr.forEach(function (attr) {
      var imageAttribute = image.getAttribute(attr);

      if (imageAttribute) {
        entityConfig[entityAttrMap[attr] || attr] = imageAttribute;
      } else {
        // 对图片宽高度多一层获取
        if (attr === 'width' || attr === 'height') {
          var attribute = image[attr];

          if (attr) {
            entityConfig[attr] = attribute;
          }
        }
      }
    });
    this.contentState = this.contentState.createEntity('IMAGE', 'IMMUTABLE', entityConfig);
    this.currentEntity = this.contentState.getLastCreatedEntityKey(); // The child text node cannot just have a space or return as content (since
    // we strip those out)

    this._appendText("\uD83D\uDCF7", style);

    this.currentEntity = null;
  }
  /** 
   Add file Block
  */
  ;

  _proto._addFileNode = function _addFileNode(node, style) {
    if (!isHTMLFileElement(node)) {
      return;
    }

    var entityConfig = {};
    var entityAttrMap = {
      'bucketname': 'bucketName',
      'objectkey': 'objectKey'
    };
    fileAttr.forEach(function (attr) {
      var fileAttribute = node.dataset[attr];

      if (fileAttribute) {
        entityConfig[entityAttrMap[attr] || attr] = fileAttribute;
      }
    });
    this.contentState = this.contentState.createEntity('FILE', 'IMMUTABLE', entityConfig);
    this.currentEntity = this.contentState.getLastCreatedEntityKey(); // The child text node cannot just have a space or return as content (since
    // we strip those out)

    this._appendText("\uD83D\uDCF7", style);

    this.currentEntity = null;
  }
  /**
   * Add Table Node
   */
  ;

  _proto._addTableNode = function _addTableNode(tableRoot, style) {
    function generateUUID() {
      var str = Math.random().toString(36).substr(3);
      str += Date.now().toString(16).substr(4);
      return str;
    }

    var trList = tableRoot.querySelectorAll('tr');
    var colList = tableRoot.querySelectorAll('col');
    var row = tableRoot.dataset.rows && Number(tableRoot.dataset.rows) || trList.length;
    var column = tableRoot.dataset.cols && Number(tableRoot.dataset.cols) || colList.length;
    var rowsId = [];
    var colsId = [];
    var combine = [];
    var columnWidth = {};
    var cell = {};
    Array(row).fill(0).forEach(function (_, index) {
      console.log(row);
      var rowId = "rowId-".concat(generateUUID());
      rowsId.push(rowId);
      cell[rowId] = {};
      var trRoot = trList[index];
      var tdList = trRoot.querySelectorAll('.brick-table-td');
      Array(column).fill(0).forEach(function (_, indexCol) {
        if (index === 0) {
          var colId = "colId-".concat(generateUUID());
          columnWidth[colId] = colList[indexCol].width ? Number(colList[indexCol].width) : 100;
          colsId.push(colId);
        }

        var tdRoot = tdList[indexCol];
        var cellId = "cellId-".concat(generateUUID());
        var rowspan = tdRoot ? tdRoot.rowSpan || null : 0;
        var colspan = tdRoot ? tdRoot.colSpan || null : 0;

        if (rowspan !== null && colspan !== null && (rowspan > 1 || colspan > 1)) {
          combine.push({
            minRow: index,
            minCol: indexCol,
            maxRow: rowspan - 1 + index,
            maxCol: colspan - 1 + indexCol
          });
        }

        var editorState = null;

        if (tdRoot) {
          var blocksFromHTML = convertFromHTMLToContentBlocks(tdList[indexCol].querySelector('.DraftEditor-root').outerHTML);

          if (blocksFromHTML.contentBlocks.length) {
            var contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
            editorState = convertToRaw(contentState);
          } else {
            editorState = convertToRaw(EditorState.createEmpty().getCurrentContent());
          }
        } else {
          editorState = convertToRaw(EditorState.createEmpty().getCurrentContent());
        }

        cell[rowId][colsId[indexCol]] = {
          cellId: cellId,
          rowspan: rowspan,
          colspan: colspan,
          editorState: editorState
        };
      });
    });
    this.contentState = this.contentState.createEntity('TABLE', 'IMMUTABLE', {
      row: Number(row),
      column: Number(column),
      rowsId: rowsId,
      colsId: colsId,
      cell: cell,
      combine: combine,
      columnWidth: columnWidth
    });
    this.currentEntity = this.contentState.getLastCreatedEntityKey(); // The child text node cannot just have a space or return as content (since
    // we strip those out)

    this._appendText("\uD83D\uDCF7", style);

    this.currentEntity = null;
  }
  /**
   * Add the content of an HTML 'a' node to the internal state. Child nodes
   * (if any) are converted to Block Configs and appended to the provided
   * blockConfig array.
   */
  ;

  _proto._addAnchorNode = function _addAnchorNode(node, blockConfigs, style) {
    // The check has already been made by isValidAnchor but
    // we have to do it again to keep flow happy.
    if (!isHTMLAnchorElement(node)) {
      return;
    }

    var anchor = node;
    var entityConfig = {};
    anchorAttr.forEach(function (attr) {
      var anchorAttribute = anchor.getAttribute(attr);

      if (anchorAttribute) {
        entityConfig[attr] = anchorAttribute;
      }
    });
    entityConfig.url = new URI(anchor.href).toString();
    this.contentState = this.contentState.createEntity('LINK', 'MUTABLE', entityConfig || {});
    this.currentEntity = this.contentState.getLastCreatedEntityKey();
    blockConfigs.push.apply(blockConfigs, this._toBlockConfigs(Array.from(node.childNodes), style));
    this.currentEntity = null;
  }
  /**
   * Walk the BlockConfig tree, compute parent/children/siblings,
   * and generate the corresponding ContentBlockNode
   */
  ;

  _proto._toContentBlocks = function _toContentBlocks(blockConfigs) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var l = blockConfigs.length - 1;

    for (var i = 0; i <= l; i++) {
      var config = blockConfigs[i];
      config.parent = parent;
      config.prevSibling = i > 0 ? blockConfigs[i - 1].key : null;
      config.nextSibling = i < l ? blockConfigs[i + 1].key : null;
      config.children = List(config.childConfigs.map(function (child) {
        return child.key;
      }));
      this.contentBlocks.push(new ContentBlockNode(_objectSpread({}, config)));

      this._toContentBlocks(config.childConfigs, config.key);
    }
  }
  /**
   * Remove 'useless' container nodes from the block config hierarchy, by
   * replacing them with their children.
   */
  ;

  _proto._hoistContainersInBlockConfigs = function _hoistContainersInBlockConfigs(blockConfigs) {
    var _this = this;

    var hoisted = List(blockConfigs).flatMap(function (blockConfig) {
      // Don't mess with useful blocks
      if (blockConfig.type !== 'unstyled' || blockConfig.text !== '') {
        return [blockConfig];
      }

      return _this._hoistContainersInBlockConfigs(blockConfig.childConfigs);
    });
    return hoisted;
  } // ***********************************************************************
  // The two methods below are used for backward compatibility when
  // experimentalTreeDataSupport is disabled.

  /**
   * Same as _toContentBlocks but replaces nested blocks by their
   * text content.
   */
  ;

  _proto._toFlatContentBlocks = function _toFlatContentBlocks(blockConfigs) {
    var _this2 = this;

    var cleanConfigs = this._hoistContainersInBlockConfigs(blockConfigs); // 再atomic前后加入一个空白block，以防block互相吞并


    if (cleanConfigs.size) {
      if (cleanConfigs.get(0).type === 'atomic') {
        cleanConfigs = (_readOnlyError("cleanConfigs"), cleanConfigs.unshift(this._makeBlockConfig()));
      }

      if (cleanConfigs.get(cleanConfigs.size - 1).type === 'atomic') {
        cleanConfigs = (_readOnlyError("cleanConfigs"), cleanConfigs.push(this._makeBlockConfig()));
      }
    }

    cleanConfigs.forEach(function (config) {
      var _this2$_extractTextFr = _this2._extractTextFromBlockConfigs(config.childConfigs),
          text = _this2$_extractTextFr.text,
          characterList = _this2$_extractTextFr.characterList; // 原子块不需要插入text


      var nextText = config.type === 'atomic' ? '' : text;

      _this2.contentBlocks.push(new ContentBlock(_objectSpread(_objectSpread({}, config), {}, {
        text: config.text + nextText,
        characterList: config.characterList.concat(characterList)
      })));
    });
  }
  /**
   * Extract the text and the associated inline styles form an
   * array of content block configs.
   */
  ;

  _proto._extractTextFromBlockConfigs = function _extractTextFromBlockConfigs(blockConfigs) {
    var l = blockConfigs.length - 1;
    var text = '';
    var characterList = List();

    for (var i = 0; i <= l; i++) {
      var config = blockConfigs[i];
      text += config.text;
      characterList = characterList.concat(config.characterList);

      if (text !== '' && config.type !== 'unstyled') {
        text += '\n';
        characterList = characterList.push(characterList.last());
      }

      var children = this._extractTextFromBlockConfigs(config.childConfigs);

      text += children.text;
      characterList = characterList.concat(children.characterList);
    }

    return {
      text: text,
      characterList: characterList
    };
  };

  return ContentBlocksBuilder;
}();
/**
 * Converts an HTML string to an array of ContentBlocks and an EntityMap
 * suitable to initialize the internal state of a Draftjs component.
 */


var convertFromHTMLToContentBlocks = function convertFromHTMLToContentBlocks(html) {
  var DOMBuilder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getSafeBodyFromHTML;
  var blockRenderMap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DefaultDraftBlockRenderMap;
  // Be ABSOLUTELY SURE that the dom builder you pass here won't execute
  // arbitrary code in whatever environment you're running this in. For an
  // example of how we try to do this in-browser, see getSafeBodyFromHTML.
  // Remove funky characters from the HTML string
  html = html.trim().replace(REGEX_CR, '').replace(REGEX_NBSP, SPACE).replace(REGEX_CARRIAGE, '').replace(REGEX_ZWS, ''); // Build a DOM tree out of the HTML string

  var safeBody = DOMBuilder(html);

  if (!safeBody) {
    return null;
  } // Build a BlockTypeMap out of the BlockRenderMap


  var blockTypeMap = buildBlockTypeMap(blockRenderMap); // Select the proper block type for the cases where the blockRenderMap
  // uses multiple block types for the same html tag.

  var disambiguate = function disambiguate(tag, wrapper, node) {
    if (tag === 'li') {
      if (node && node.classList && node.classList.contains('checkable-list-item')) {
        return 'checkable-list-item';
      }

      return wrapper === 'ol' ? 'ordered-list-item' : 'unordered-list-item';
    }

    return null;
  };

  return new ContentBlocksBuilder(blockTypeMap, disambiguate).addDOMNode(safeBody).getContentBlocks();
};

module.exports = convertFromHTMLToContentBlocks;