/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {EntityMap} from 'EntityMap';

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DraftEntity = require('DraftEntity');
const URI = require('URI');

const cx = require('cx');
const generateRandomKey = require('generateRandomKey');
const getSafeBodyFromHTML = require('getSafeBodyFromHTML');
const gkx = require('gkx');
const {List, Map, OrderedSet} = require('immutable');

const experimentalTreeDataSupport = gkx('draft_tree_data_support');

const NBSP = '&nbsp;';
const SPACE = ' ';

// used for replacing characters in HTML
const REGEX_CR = new RegExp('\r', 'g');
const REGEX_LF = new RegExp('\n', 'g');
const REGEX_LEADING_LF = new RegExp('^\n', 'g');
const REGEX_NBSP = new RegExp(NBSP, 'g');
const REGEX_CARRIAGE = new RegExp('&#13;?', 'g');
const REGEX_ZWS = new RegExp('&#8203;?', 'g');

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
const boldValues = ['bold', 'bolder', '500', '600', '700', '800', '900'];
const notBoldValues = ['light', 'lighter', '100', '200', '300', '400'];

const anchorAttr = ['className', 'href', 'rel', 'target', 'title'];
const imgAttr = ['alt', 'className', 'height', 'src', 'width'];

const knownListItemDepthClasses = {
  [cx('public/DraftStyleDefault/depth0')]: 0,
  [cx('public/DraftStyleDefault/depth1')]: 1,
  [cx('public/DraftStyleDefault/depth2')]: 2,
  [cx('public/DraftStyleDefault/depth3')]: 3,
  [cx('public/DraftStyleDefault/depth4')]: 4,
};

const HTMLTagToInlineStyleMap: Map<string, string> = Map({
  b: 'BOLD',
  code: 'CODE',
  del: 'STRIKETHROUGH',
  em: 'ITALIC',
  i: 'ITALIC',
  s: 'STRIKETHROUGH',
  strike: 'STRIKETHROUGH',
  strong: 'BOLD',
  u: 'UNDERLINE',
  mark: 'HIGHLIGHT',
});

type BlockTypeMap = Map<string, string | Array<string>>;

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
const buildBlockTypeMap = (
  blockRenderMap: DraftBlockRenderMap,
): BlockTypeMap => {
  const blockTypeMap = {};

  blockRenderMap.mapKeys((blockType, desc) => {
    const elements = [desc.element];
    if (desc.aliasedElements !== undefined) {
      elements.push(...desc.aliasedElements);
    }
    elements.forEach(element => {
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

/**
 * If we're pasting from one DraftEditor to another we can check to see if
 * existing list item depth classes are being used and preserve this style
 */
const getListItemDepth = (node: HTMLElement, depth: number = 0): number => {
  Object.keys(knownListItemDepthClasses).some(depthClass => {
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
const isValidAnchor = (node: Node) => {
  return !!(
    node instanceof HTMLAnchorElement &&
    node.href &&
    (node.protocol === 'http:' ||
      node.protocol === 'https:' ||
      node.protocol === 'mailto:')
  );
};

/**
 * Return true if the provided HTML Element can be used to build a
 * Draftjs-compatible image.
 */
const isValidImage = (node: Node): boolean => {
  return !!(
    node instanceof HTMLImageElement &&
    node.attributes.getNamedItem('src') &&
    node.attributes.getNamedItem('src').value
  );
};

/**
 * Determine if a nodeName is a list type, 'ul' or 'ol'
 */
const isListNode = (nodeName: ?string): boolean =>
  nodeName === 'ul' || nodeName === 'ol';

/**
 *  ContentBlockConfig is a mutable data structure that holds all
 *  the information required to build a ContentBlock and an array of
 *  all the child nodes (childConfigs).
 *  It is being used a temporary data structure by the
 *  ContentBlocksBuilder class.
 */
type ContentBlockConfig = {
  characterList: List<CharacterMetadata>,
  data?: Map<any, any>,
  depth?: number,
  key: string,
  text: string,
  type: string,
  children: List<string>,
  parent: ?string,
  prevSibling: ?string,
  nextSibling: ?string,
  childConfigs: Array<ContentBlockConfig>,
};

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
class ContentBlocksBuilder {
  // Most of the method in the class depend on the state of the content builder
  // (i.e. currentBlockType, currentDepth, currentEntity etc.). Though it may
  // be confusing at first, it made the code simpler than the alternative which
  // is to pass those values around in every call.

  // The following attributes are used to accumulate text and styles
  // as we are walking the HTML node tree.
  characterList: List<CharacterMetadata> = List();
  currentBlockType: string = 'unstyled';
  currentDepth: number = -1;
  currentEntity: ?string = null;
  currentStyle: DraftInlineStyle = OrderedSet();
  currentText: string = '';
  wrapper: ?string = null;

  // Describes the future ContentState as a tree of content blocks
  blockConfigs: Array<ContentBlockConfig> = [];

  // The content blocks generated from the blockConfigs
  contentBlocks: Array<BlockNodeRecord> = [];

  // Entity map use to store links and images found in the HTML nodes
  entityMap: EntityMap = DraftEntity;

  // Map HTML tags to draftjs block types and disambiguation function
  blockTypeMap: BlockTypeMap;
  disambiguate: (string, ?string) => ?string;

  constructor(
    blockTypeMap: BlockTypeMap,
    disambiguate: (string, ?string) => ?string,
  ): void {
    this.clear();
    this.blockTypeMap = blockTypeMap;
    this.disambiguate = disambiguate;
  }

  /**
   * Clear the internal state of the ContentBlocksBuilder
   */
  clear(): void {
    this.characterList = List();
    this.blockConfigs = [];
    this.currentBlockType = 'unstyled';
    this.currentDepth = -1;
    this.currentEntity = null;
    this.currentStyle = OrderedSet();
    this.currentText = '';
    this.entityMap = DraftEntity;
    this.wrapper = null;
    this.contentBlocks = [];
  }

  /**
   * Add an HTMLElement to the ContentBlocksBuilder
   */
  addDOMNode(node: Node): ContentBlocksBuilder {
    this.contentBlocks = [];
    // Converts the HTML node to block config
    this.blockConfigs.push(...this._toBlockConfigs([node]));

    // There might be some left over text in the builder's
    // internal state, if so make a ContentBlock out of it.
    this._trimCurrentText();
    if (this.currentText !== '') {
      this.blockConfigs.push(this._makeBlockConfig());
    }

    // for chaining
    return this;
  }

  /**
   * Return the ContentBlocks and the EntityMap that corresponds
   * to the previously added HTML nodes.
   */
  getContentBlocks(): {
    contentBlocks: ?Array<BlockNodeRecord>,
    entityMap: EntityMap,
  } {
    if (this.contentBlocks.length === 0) {
      if (experimentalTreeDataSupport) {
        this._toContentBlocks(this.blockConfigs);
      } else {
        this._toFlatContentBlocks(this.blockConfigs);
      }
    }
    return {
      contentBlocks: this.contentBlocks,
      entityMap: this.entityMap,
    };
  }

  /**
   * Add a new inline style to the upcoming nodes.
   */
  addStyle(inlineStyle: string): void {
    this.currentStyle = this.currentStyle.add(inlineStyle);
  }

  /**
   * Remove a currently applied inline style.
   */
  removeStyle(inlineStyle: string): void {
    this.currentStyle = this.currentStyle.remove(inlineStyle);
  }

  // ***********************************WARNING******************************
  // The methods below this line are private - don't call them directly.

  /**
   * Generate a new ContentBlockConfig out of the current internal state
   * of the builder, then clears the internal state.
   */
  _makeBlockConfig(config: Object = {}): ContentBlockConfig {
    const key = config.key || generateRandomKey();
    const block = {
      key,
      type: this.currentBlockType,
      text: this.currentText,
      characterList: this.characterList,
      depth: Math.max(0, this.currentDepth),
      parent: null,
      children: List(),
      prevSibling: null,
      nextSibling: null,
      childConfigs: [],
      ...config,
    };
    this.characterList = List();
    this.currentBlockType = 'unstyled';
    this.currentDepth = -1;
    this.currentText = '';
    return block;
  }

  /**
   * Converts an array of HTML elements to a multi-root tree of content
   * block configs. Some text content may be left in the builders internal
   * state to enable chaining sucessive calls.
   */
  _toBlockConfigs(nodes: Array<Node>): Array<ContentBlockConfig> {
    const blockConfigs = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeName = node.nodeName.toLowerCase();

      if (nodeName === 'body' || isListNode(nodeName)) {
        // body, ol and ul are 'block' type nodes so create a block config
        // with the text accumulated so far (if any)
        this._trimCurrentText();
        if (this.currentText !== '') {
          blockConfigs.push(this._makeBlockConfig());
        }

        // body, ol and ul nodes are ignored, but their children are inlined in
        // the parent block config.
        const wasCurrentDepth = this.currentDepth;
        const wasWrapper = this.wrapper;
        if (isListNode(nodeName)) {
          this.wrapper = nodeName;
          if (isListNode(wasWrapper)) {
            this.currentDepth++;
          }
        }
        blockConfigs.push(...this._toBlockConfigs(Array.from(node.childNodes)));
        this.currentDepth = wasCurrentDepth;
        this.wrapper = wasWrapper;
        continue;
      }

      let blockType = this.blockTypeMap.get(nodeName);
      if (blockType !== undefined) {
        // 'block' type node means we need to create a block config
        // with the text accumulated so far (if any)
        this._trimCurrentText();
        if (this.currentText !== '') {
          blockConfigs.push(this._makeBlockConfig());
        }

        const wasCurrentDepth = this.currentDepth;
        const wasWrapper = this.wrapper;
        this.wrapper = nodeName === 'pre' ? 'pre' : this.wrapper;

        if (typeof blockType !== 'string') {
          blockType =
            this.disambiguate(nodeName, this.wrapper) ||
            blockType[0] ||
            'unstyled';
        }

        if (
          !experimentalTreeDataSupport &&
          node instanceof HTMLElement &&
          (blockType === 'unordered-list-item' ||
            blockType === 'ordered-list-item')
        ) {
          this.currentDepth = getListItemDepth(node, this.currentDepth);
        }

        const key = generateRandomKey();
        const childConfigs = this._toBlockConfigs(Array.from(node.childNodes));
        this._trimCurrentText();
        blockConfigs.push(
          this._makeBlockConfig({
            key,
            childConfigs,
            type: blockType,
          }),
        );

        this.currentDepth = wasCurrentDepth;
        this.wrapper = wasWrapper;
        continue;
      }

      if (nodeName === '#text') {
        this._addTextNode(node);
        continue;
      }

      if (nodeName === 'br') {
        this._addBreakNode(node);
        continue;
      }

      if (isValidImage(node)) {
        this._addImgNode(node);
        continue;
      }

      if (isValidAnchor(node)) {
        this._addAnchorNode(node, blockConfigs);
        continue;
      }

      const inlineStyle = HTMLTagToInlineStyleMap.get(nodeName);
      if (inlineStyle !== undefined) {
        this.addStyle(inlineStyle);
      }

      blockConfigs.push(...this._toBlockConfigs(Array.from(node.childNodes)));

      if (inlineStyle !== undefined) {
        this.removeStyle(inlineStyle);
      }

      this._updateStyleFromNodeAttributes(node);
    }

    return blockConfigs;
  }

  /**
   * Append a string of text to the internal buffer.
   */
  _appendText(text: string) {
    this.currentText += text;
    const characterMetadata = CharacterMetadata.create({
      style: this.currentStyle,
      entity: this.currentEntity,
    });
    this.characterList = this.characterList.push(
      ...Array(text.length).fill(characterMetadata),
    );
  }

  /**
   * Trim the text in the internal buffer.
   */
  _trimCurrentText() {
    const l = this.currentText.length;
    let begin = l - this.currentText.trimLeft().length;
    let end = this.currentText.trimRight().length;

    // We should not trim whitespaces for which an entity is defined.
    let entity = this.characterList.findEntry(
      characterMetadata => characterMetadata.getEntity() !== null,
    );
    begin = entity !== undefined ? Math.min(begin, entity[0]) : begin;

    entity = this.characterList
      .reverse()
      .findEntry(characterMetadata => characterMetadata.getEntity() !== null);
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
  _addTextNode(node: Node) {
    let text = node.textContent;
    const trimmedText = text.trim();

    // If we are not in a pre block and the trimmed content is empty,
    // normalize to a single space.
    if (trimmedText === '' && this.wrapper !== 'pre') {
      text = ' ';
    }

    if (this.wrapper !== 'pre') {
      // Trim leading line feed, which is invisible in HTML
      text = text.replace(REGEX_LEADING_LF, '');

      // Can't use empty string because MSWord
      text = text.replace(REGEX_LF, SPACE);
    }

    this._appendText(text);
  }

  _addBreakNode(node: Node) {
    if (!(node instanceof HTMLBRElement)) {
      return;
    }
    this._appendText('\n');
  }

  /**
   * Add the content of an HTML img node to the internal state
   */
  _addImgNode(node: Node) {
    if (!(node instanceof HTMLImageElement)) {
      return;
    }
    const image: HTMLImageElement = node;
    const entityConfig = {};

    imgAttr.forEach(attr => {
      const imageAttribute = image.getAttribute(attr);
      if (imageAttribute) {
        entityConfig[attr] = imageAttribute;
      }
    });

    // TODO: T15530363 update this when we remove DraftEntity entirely
    this.currentEntity = this.entityMap.__create(
      'IMAGE',
      'MUTABLE',
      entityConfig,
    );

    // The child text node cannot just have a space or return as content (since
    // we strip those out), unless the image is for presentation only.
    // See https://github.com/facebook/draft-js/issues/231 for some context.
    if (gkx('draftjs_fix_paste_for_img')) {
      if (node.getAttribute('role') !== 'presentation') {
        this._appendText('\ud83d\udcf7');
      }
    } else {
      this._appendText('\ud83d\udcf7');
    }

    this.currentEntity = null;
  }

  /**
   * Add the content of an HTML 'a' node to the internal state. Child nodes
   * (if any) are converted to Block Configs and appended to the provided
   * blockConfig array.
   */
  _addAnchorNode(node: Node, blockConfigs: Array<ContentBlockConfig>) {
    // The check has already been made by isValidAnchor but
    // we have to do it again to keep flow happy.
    if (!(node instanceof HTMLAnchorElement)) {
      return;
    }
    const anchor: HTMLAnchorElement = node;
    const entityConfig = {};

    anchorAttr.forEach(attr => {
      const anchorAttribute = anchor.getAttribute(attr);
      if (anchorAttribute) {
        entityConfig[attr] = anchorAttribute;
      }
    });

    entityConfig.url = new URI(anchor.href).toString();
    // TODO: T15530363 update this when we remove DraftEntity completely
    this.currentEntity = this.entityMap.__create(
      'LINK',
      'MUTABLE',
      entityConfig || {},
    );

    blockConfigs.push(...this._toBlockConfigs(Array.from(node.childNodes)));
    this.currentEntity = null;
  }

  /**
   * Try to guess the inline style of an HTML element based on its css
   * styles (font-weight, font-style and text-decoration).
   */
  _updateStyleFromNodeAttributes(node: Node) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const htmlElement = node;
    const fontWeight = htmlElement.style.fontWeight;
    const fontStyle = htmlElement.style.fontStyle;
    const textDecoration = htmlElement.style.textDecoration;

    if (boldValues.indexOf(fontWeight) >= 0) {
      this.addStyle('BOLD');
    } else if (notBoldValues.indexOf(fontWeight) >= 0) {
      this.removeStyle('BOLD');
    }

    if (fontStyle === 'italic') {
      this.addStyle('ITALIC');
    } else if (fontStyle === 'normal') {
      this.removeStyle('ITALIC');
    }

    if (textDecoration === 'underline') {
      this.addStyle('UNDERLINE');
    }
    if (textDecoration === 'line-through') {
      this.addStyle('STRIKETHROUGH');
    }
    if (textDecoration === 'none') {
      this.removeStyle('UNDERLINE');
      this.removeStyle('STRIKETHROUGH');
    }
  }

  /**
   * Walk the BlockConfig tree, compute parent/children/siblings,
   * and generate the corresponding ContentBlockNode
   */
  _toContentBlocks(
    blockConfigs: Array<ContentBlockConfig>,
    parent: ?string = null,
  ) {
    const l = blockConfigs.length - 1;
    for (let i = 0; i <= l; i++) {
      const config = blockConfigs[i];
      config.parent = parent;
      config.prevSibling = i > 0 ? blockConfigs[i - 1].key : null;
      config.nextSibling = i < l ? blockConfigs[i + 1].key : null;
      config.children = List(config.childConfigs.map(child => child.key));
      this.contentBlocks.push(new ContentBlockNode({...config}));
      this._toContentBlocks(config.childConfigs, config.key);
    }
  }

  // ***********************************************************************
  // The two methods below are used for backward compatibility when
  // experimentalTreeDataSupport is disabled.

  /**
   * Same as _toContentBlocks but replaces nested blocks by their
   * text content.
   */
  _toFlatContentBlocks(blockConfigs: Array<ContentBlockConfig>) {
    const l = blockConfigs.length - 1;
    for (let i = 0; i <= l; i++) {
      const config = blockConfigs[i];
      const {text, characterList} = this._extractTextFromBlockConfigs(
        config.childConfigs,
      );
      this.contentBlocks.push(
        new ContentBlock({
          ...config,
          text: config.text + text,
          characterList: config.characterList.concat(characterList),
        }),
      );
    }
  }

  /**
   * Extract the text and the associated inline styles form an
   * array of content block configs.
   */
  _extractTextFromBlockConfigs(
    blockConfigs: Array<ContentBlockConfig>,
  ): {
    text: string,
    characterList: List<CharacterMetadata>,
  } {
    const l = blockConfigs.length - 1;
    let text = '';
    let characterList = List();
    for (let i = 0; i <= l; i++) {
      const config = blockConfigs[i];
      text += config.text;
      characterList = characterList.concat(config.characterList);
      /* $FlowFixMe(>=0.68.0 site=www,mobile) This comment suppresses an error
       * found when Flow v0.68 was deployed. To see the error delete this
       * comment and run Flow. */
      if (text !== '' && config.blockType !== 'unstyled') {
        text += '\n';
        characterList = characterList.push(characterList.last());
      }
      const children = this._extractTextFromBlockConfigs(config.childConfigs);
      text += children.text;
      characterList = characterList.concat(children.characterList);
    }
    return {text, characterList};
  }
}

/**
 * Converts an HTML string to an array of ContentBlocks and an EntityMap
 * suitable to initialize the internal state of a Draftjs component.
 */
const convertFromHTMLToContentBlocks = (
  html: string,
  DOMBuilder: Function = getSafeBodyFromHTML,
  blockRenderMap?: DraftBlockRenderMap = DefaultDraftBlockRenderMap,
): ?{contentBlocks: ?Array<BlockNodeRecord>, entityMap: EntityMap} => {
  // Be ABSOLUTELY SURE that the dom builder you pass here won't execute
  // arbitrary code in whatever environment you're running this in. For an
  // example of how we try to do this in-browser, see getSafeBodyFromHTML.

  // Remove funky characters from the HTML string
  html = html
    .trim()
    .replace(REGEX_CR, '')
    .replace(REGEX_NBSP, SPACE)
    .replace(REGEX_CARRIAGE, '')
    .replace(REGEX_ZWS, '');

  // Build a DOM tree out of the HTML string
  const safeBody = DOMBuilder(html);
  if (!safeBody) {
    return null;
  }

  // Build a BlockTypeMap out of the BlockRenderMap
  const blockTypeMap = buildBlockTypeMap(blockRenderMap);

  // Select the proper block type for the cases where the blockRenderMap
  // uses multiple block types for the same html tag.
  const disambiguate = (tag: string, wrapper: ?string): ?string => {
    if (tag === 'li') {
      return wrapper === 'ol' ? 'ordered-list-item' : 'unordered-list-item';
    }
    return null;
  };

  return new ContentBlocksBuilder(blockTypeMap, disambiguate)
    .addDOMNode(safeBody)
    .getContentBlocks();
};

module.exports = convertFromHTMLToContentBlocks;
