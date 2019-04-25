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
import type {DraftBlockRenderConfig} from 'DraftBlockRenderConfig';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {DraftBlockType} from 'DraftBlockType';
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
const Immutable = require('immutable');
const {Set} = require('immutable');
const invariant = require('invariant');
const sanitizeDraftText = require('sanitizeDraftText');

const experimentalTreeDataSupport = gkx('draft_tree_data_support');

type Block = {
  type: DraftBlockType,
  depth: number,
  key?: string,
  parent?: string,
};

type Chunk = {
  text: string,
  inlines: Array<DraftInlineStyle>,
  entities: Array<string>,
  blocks: Array<Block>,
};

const {List, OrderedSet} = Immutable;

const NBSP = '&nbsp;';
const SPACE = ' ';

// Arbitrary max indent
const MAX_DEPTH = 4;

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

// Block tag flow is different because LIs do not have
// a deterministic style ;_;
const inlineTags = {
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
};

const knownListItemDepthClasses = {
  [cx('public/DraftStyleDefault/depth0')]: 0,
  [cx('public/DraftStyleDefault/depth1')]: 1,
  [cx('public/DraftStyleDefault/depth2')]: 2,
  [cx('public/DraftStyleDefault/depth3')]: 3,
  [cx('public/DraftStyleDefault/depth4')]: 4,
};

const anchorAttr = ['className', 'href', 'rel', 'target', 'title'];

const imgAttr = ['alt', 'className', 'height', 'src', 'width'];

let lastBlock;

const EMPTY_CHUNK = {
  text: '',
  inlines: [],
  entities: [],
  blocks: [],
};

const EMPTY_BLOCK = {
  children: List(),
  depth: 0,
  key: '',
  type: '',
};

const getListBlockType = (tag: string, lastList: ?string): ?DraftBlockType => {
  if (tag === 'li') {
    return lastList === 'ol' ? 'ordered-list-item' : 'unordered-list-item';
  }
  return null;
};

const getBlockMapSupportedTags = (
  blockRenderMap: DraftBlockRenderMap,
): Array<string> => {
  const unstyledElement = blockRenderMap.get('unstyled').element;
  let tags = Set([]);

  blockRenderMap.forEach((draftBlock: DraftBlockRenderConfig) => {
    if (draftBlock.aliasedElements) {
      draftBlock.aliasedElements.forEach(tag => {
        tags = tags.add(tag);
      });
    }

    tags = tags.add(draftBlock.element);
  });

  return tags
    .filter(tag => tag && tag !== unstyledElement)
    .toArray()
    .sort();
};

// custom element conversions
const getMultiMatchedType = (
  tag: string,
  lastList: ?string,
  multiMatchExtractor: Array<Function>,
): ?DraftBlockType => {
  for (let ii = 0; ii < multiMatchExtractor.length; ii++) {
    const matchType = multiMatchExtractor[ii](tag, lastList);
    if (matchType) {
      return matchType;
    }
  }
  return null;
};

const getBlockTypeForTag = (
  tag: string,
  lastList: ?string,
  blockRenderMap: DraftBlockRenderMap,
): DraftBlockType => {
  const matchedTypes = blockRenderMap
    .filter(
      (draftBlock: DraftBlockRenderConfig) =>
        draftBlock.element === tag ||
        draftBlock.wrapper === tag ||
        (draftBlock.aliasedElements &&
          draftBlock.aliasedElements.some(alias => alias === tag)),
    )
    .keySeq()
    .toSet()
    .toArray()
    .sort();

  // if we dont have any matched type, return unstyled
  // if we have one matched type return it
  // if we have multi matched types use the multi-match function to gather type
  switch (matchedTypes.length) {
    case 0:
      return 'unstyled';
    case 1:
      return matchedTypes[0];
    default:
      return (
        getMultiMatchedType(tag, lastList, [getListBlockType]) || 'unstyled'
      );
  }
};

const processInlineTag = (
  tag: string,
  node: Node,
  currentStyle: DraftInlineStyle,
): DraftInlineStyle => {
  const styleToCheck = inlineTags[tag];
  if (styleToCheck) {
    currentStyle = currentStyle.add(styleToCheck).toOrderedSet();
  } else if (node instanceof HTMLElement) {
    const htmlElement = node;
    currentStyle = currentStyle
      .withMutations(style => {
        const fontWeight = htmlElement.style.fontWeight;
        const fontStyle = htmlElement.style.fontStyle;
        const textDecoration = htmlElement.style.textDecoration;

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
      })
      .toOrderedSet();
  }
  return currentStyle;
};

const joinChunks = (
  A: Chunk,
  B: Chunk,
  experimentalHasNestedBlocks?: boolean,
): Chunk => {
  // Sometimes two blocks will touch in the DOM and we need to strip the
  // extra delimiter to preserve niceness.
  const lastInA = A.text.slice(-1);
  const firstInB = B.text.slice(0, 1);

  if (lastInA === '\r' && firstInB === '\r' && !experimentalHasNestedBlocks) {
    A.text = A.text.slice(0, -1);
    A.inlines.pop();
    A.entities.pop();
    A.blocks.pop();
  }

  // Kill whitespace after blocks
  if (lastInA === '\r') {
    if (B.text === SPACE || B.text === '\n') {
      return A;
    } else if (firstInB === SPACE || firstInB === '\n') {
      B.text = B.text.slice(1);
      B.inlines.shift();
      B.entities.shift();
    }
  }

  return {
    text: A.text + B.text,
    inlines: A.inlines.concat(B.inlines),
    entities: A.entities.concat(B.entities),
    blocks: A.blocks.concat(B.blocks),
  };
};

/**
 * Check to see if we have anything like <p> <blockquote> <h1>... to create
 * block tags from. If we do, we can use those and ignore <div> tags. If we
 * don't, we can treat <div> tags as meaningful (unstyled) blocks.
 */
const containsSemanticBlockMarkup = (
  html: string,
  blockTags: Array<string>,
): boolean => {
  return blockTags.some(tag => html.indexOf('<' + tag) !== -1);
};

const hasValidLinkText = (link: Node): boolean => {
  invariant(
    link instanceof HTMLAnchorElement,
    'Link must be an HTMLAnchorElement.',
  );
  const protocol = link.protocol;
  return (
    protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
  );
};

const getWhitespaceChunk = (inEntity: ?string): Chunk => {
  const entities = new Array(1);
  if (inEntity) {
    entities[0] = inEntity;
  }
  return {
    ...EMPTY_CHUNK,
    text: SPACE,
    inlines: [OrderedSet()],
    entities,
  };
};

const getSoftNewlineChunk = (): Chunk => {
  return {
    ...EMPTY_CHUNK,
    text: '\n',
    inlines: [OrderedSet()],
    entities: new Array(1),
  };
};

const getChunkedBlock = (props: Object = {}): Block => {
  return {
    ...EMPTY_BLOCK,
    ...props,
  };
};

const getBlockDividerChunk = (
  block: DraftBlockType,
  depth: number,
  parentKey: ?string = null,
): Chunk => {
  return {
    text: '\r',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [
      getChunkedBlock({
        parent: parentKey,
        key: generateRandomKey(),
        type: block,
        depth: Math.max(0, Math.min(MAX_DEPTH, depth)),
      }),
    ],
  };
};

/**
 *  If we're pasting from one DraftEditor to another we can check to see if
 *  existing list item depth classes are being used and preserve this style
 */
const getListItemDepth = (node: HTMLElement, depth: number = 0): number => {
  Object.keys(knownListItemDepthClasses).some(depthClass => {
    if (node.classList.contains(depthClass)) {
      depth = knownListItemDepthClasses[depthClass];
    }
  });
  return depth;
};

const genFragment = (
  entityMap: EntityMap,
  node: Node,
  inlineStyle: DraftInlineStyle,
  lastList: string,
  inBlock: ?string,
  blockTags: Array<string>,
  depth: number,
  blockRenderMap: DraftBlockRenderMap,
  inEntity?: ?string,
  parentKey?: ?string,
): {chunk: Chunk, entityMap: EntityMap} => {
  const lastLastBlock = lastBlock;
  let nodeName = node.nodeName.toLowerCase();
  let newEntityMap = entityMap;
  let nextBlockType = 'unstyled';
  let newBlock = false;
  const inBlockType =
    inBlock && getBlockTypeForTag(inBlock, lastList, blockRenderMap);
  let chunk = {...EMPTY_CHUNK};
  let newChunk: ?Chunk = null;
  let blockKey;

  // Base Case
  if (nodeName === '#text') {
    let text = node.textContent;
    const nodeTextContent = text.trim();

    // We should not create blocks for leading spaces that are
    // existing around ol/ul and their children list items
    if (lastList && nodeTextContent === '' && node.parentElement) {
      const parentNodeName = node.parentElement.nodeName.toLowerCase();
      if (parentNodeName === 'ol' || parentNodeName === 'ul') {
        return {chunk: {...EMPTY_CHUNK}, entityMap};
      }
    }

    if (nodeTextContent === '' && inBlock !== 'pre') {
      return {chunk: getWhitespaceChunk(inEntity), entityMap};
    }
    if (inBlock !== 'pre') {
      // Trim leading line feed, which is invisible in HTML
      text = text.replace(REGEX_LEADING_LF, '');

      // Can't use empty string because MSWord
      text = text.replace(REGEX_LF, SPACE);
    }

    // save the last block so we can use it later
    lastBlock = nodeName;

    return {
      chunk: {
        text,
        inlines: Array(text.length).fill(inlineStyle),
        entities: Array(text.length).fill(inEntity),
        blocks: [],
      },
      entityMap,
    };
  }

  // save the last block so we can use it later
  lastBlock = nodeName;

  // BR tags
  if (nodeName === 'br') {
    if (lastLastBlock === 'br' && (!inBlock || inBlockType === 'unstyled')) {
      return {
        chunk: getBlockDividerChunk('unstyled', depth, parentKey),
        entityMap,
      };
    }
    return {chunk: getSoftNewlineChunk(), entityMap};
  }

  // IMG tags
  if (
    nodeName === 'img' &&
    node instanceof HTMLImageElement &&
    node.attributes.getNamedItem('src') &&
    node.attributes.getNamedItem('src').value
  ) {
    const image: HTMLImageElement = node;
    const entityConfig = {};

    imgAttr.forEach(attr => {
      const imageAttribute = image.getAttribute(attr);
      if (imageAttribute) {
        entityConfig[attr] = imageAttribute;
      }
    });
    // Forcing this node to have children because otherwise no entity will be
    // created for this node.
    // The child text node cannot just have a space or return as content (since
    // we strip those out), unless the image is for presentation only.
    // See https://github.com/facebook/draft-js/issues/231 for some context.
    if (gkx('draftjs_fix_paste_for_img')) {
      if (node.getAttribute('role') !== 'presentation') {
        node.textContent = '\ud83d\udcf7';
      }
    } else {
      node.textContent = '\ud83d\udcf7';
    }

    // TODO: update this when we remove DraftEntity entirely
    inEntity = DraftEntity.__create('IMAGE', 'MUTABLE', entityConfig || {});
  }

  // Inline tags
  inlineStyle = processInlineTag(nodeName, node, inlineStyle);

  // Handle lists
  if (nodeName === 'ul' || nodeName === 'ol') {
    if (lastList) {
      depth += 1;
    }
    lastList = nodeName;
  }

  if (
    !experimentalTreeDataSupport &&
    nodeName === 'li' &&
    node instanceof HTMLElement
  ) {
    depth = getListItemDepth(node, depth);
  }

  const blockType = getBlockTypeForTag(nodeName, lastList, blockRenderMap);
  const inListBlock = lastList && inBlock === 'li' && nodeName === 'li';
  const inBlockOrHasNestedBlocks =
    (!inBlock || experimentalTreeDataSupport) &&
    blockTags.indexOf(nodeName) !== -1;

  // Block Tags
  if (inListBlock || inBlockOrHasNestedBlocks) {
    chunk = getBlockDividerChunk(blockType, depth, parentKey);
    blockKey = chunk.blocks[0].key;
    inBlock = nodeName;
    newBlock = !experimentalTreeDataSupport;
  }

  // this is required so that we can handle 'ul' and 'ol'
  if (inListBlock) {
    nextBlockType =
      lastList === 'ul' ? 'unordered-list-item' : 'ordered-list-item';
  }

  // Recurse through children
  let child: ?Node = node.firstChild;
  if (child != null) {
    nodeName = child.nodeName.toLowerCase();
  }

  let entityId: ?string = null;

  while (child) {
    if (
      child instanceof HTMLAnchorElement &&
      child.href &&
      hasValidLinkText(child)
    ) {
      const anchor: HTMLAnchorElement = child;
      const entityConfig = {};

      anchorAttr.forEach(attr => {
        const anchorAttribute = anchor.getAttribute(attr);
        if (anchorAttribute) {
          entityConfig[attr] = anchorAttribute;
        }
      });

      entityConfig.url = new URI(anchor.href).toString();
      // TODO: update this when we remove DraftEntity completely
      entityId = DraftEntity.__create('LINK', 'MUTABLE', entityConfig || {});
    } else {
      entityId = undefined;
    }

    const {
      chunk: generatedChunk,
      entityMap: maybeUpdatedEntityMap,
    } = genFragment(
      newEntityMap,
      child,
      inlineStyle,
      lastList,
      inBlock,
      blockTags,
      depth,
      blockRenderMap,
      entityId || inEntity,
      experimentalTreeDataSupport ? blockKey : null,
    );

    newChunk = generatedChunk;
    newEntityMap = maybeUpdatedEntityMap;

    chunk = joinChunks(chunk, newChunk, experimentalTreeDataSupport);
    const sibling: ?Node = child.nextSibling;

    // Put in a newline to break up blocks inside blocks
    if (!parentKey && sibling && blockTags.indexOf(nodeName) >= 0 && inBlock) {
      chunk = joinChunks(chunk, getSoftNewlineChunk());
    }
    if (sibling) {
      nodeName = sibling.nodeName.toLowerCase();
    }
    child = sibling;
  }

  if (newBlock) {
    chunk = joinChunks(
      chunk,
      getBlockDividerChunk(nextBlockType, depth, parentKey),
    );
  }

  return {chunk, entityMap: newEntityMap};
};

const getChunkForHTML = (
  html: string,
  DOMBuilder: Function,
  blockRenderMap: DraftBlockRenderMap,
  entityMap: EntityMap,
): ?{chunk: Chunk, entityMap: EntityMap} => {
  html = html
    .trim()
    .replace(REGEX_CR, '')
    .replace(REGEX_NBSP, SPACE)
    .replace(REGEX_CARRIAGE, '')
    .replace(REGEX_ZWS, '');

  const supportedBlockTags = getBlockMapSupportedTags(blockRenderMap);

  const safeBody = DOMBuilder(html);
  if (!safeBody) {
    return null;
  }
  lastBlock = null;

  // Sometimes we aren't dealing with content that contains nice semantic
  // tags. In this case, use divs to separate everything out into paragraphs
  // and hope for the best.
  const workingBlocks = containsSemanticBlockMarkup(html, supportedBlockTags)
    ? supportedBlockTags
    : ['div'];

  // Start with -1 block depth to offset the fact that we are passing in a fake
  // UL block to start with.
  const fragment = genFragment(
    entityMap,
    safeBody,
    OrderedSet(),
    'ul',
    null,
    workingBlocks,
    -1,
    blockRenderMap,
  );

  let chunk = fragment.chunk;
  const newEntityMap = fragment.entityMap;

  // join with previous block to prevent weirdness on paste
  if (chunk.text.indexOf('\r') === 0) {
    chunk = {
      text: chunk.text.slice(1),
      inlines: chunk.inlines.slice(1),
      entities: chunk.entities.slice(1),
      blocks: chunk.blocks,
    };
  }

  // Kill block delimiter at the end
  if (chunk.text.slice(-1) === '\r') {
    chunk.text = chunk.text.slice(0, -1);
    chunk.inlines = chunk.inlines.slice(0, -1);
    chunk.entities = chunk.entities.slice(0, -1);
    chunk.blocks.pop();
  }

  // If we saw no block tags, put an unstyled one in
  if (chunk.blocks.length === 0) {
    chunk.blocks.push({
      ...EMPTY_CHUNK,
      type: 'unstyled',
      depth: 0,
    });
  }

  // Sometimes we start with text that isn't in a block, which is then
  // followed by blocks. Need to fix up the blocks to add in
  // an unstyled block for this content
  if (chunk.text.split('\r').length === chunk.blocks.length + 1) {
    chunk.blocks.unshift({type: 'unstyled', depth: 0});
  }

  return {chunk, entityMap: newEntityMap};
};

const convertChunkToContentBlocks = (chunk: Chunk): ?Array<BlockNodeRecord> => {
  if (!chunk || !chunk.text || !Array.isArray(chunk.blocks)) {
    return null;
  }

  const initialState = {
    cacheRef: {},
    contentBlocks: [],
  };

  let start = 0;

  const {blocks: rawBlocks, inlines: rawInlines, entities: rawEntities} = chunk;

  const BlockNodeRecord = experimentalTreeDataSupport
    ? ContentBlockNode
    : ContentBlock;

  return chunk.text.split('\r').reduce((acc, textBlock, index) => {
    // Make absolutely certain that our text is acceptable.
    textBlock = sanitizeDraftText(textBlock);

    const block = rawBlocks[index];
    const end = start + textBlock.length;
    const inlines = rawInlines.slice(start, end);
    const entities = rawEntities.slice(start, end);
    const characterList = List(
      inlines.map((style, index) => {
        const data = {style, entity: (null: ?string)};
        if (entities[index]) {
          data.entity = entities[index];
        }
        return CharacterMetadata.create(data);
      }),
    );
    start = end + 1;

    const {depth, type, parent} = block;

    const key = block.key || generateRandomKey();
    let parentTextNodeKey = null; // will be used to store container text nodes

    // childrens add themselves to their parents since we are iterating in order
    if (parent) {
      const parentIndex = acc.cacheRef[parent];
      let parentRecord = acc.contentBlocks[parentIndex];

      // if parent has text we need to split it into a separate unstyled element
      if (parentRecord.getChildKeys().isEmpty() && parentRecord.getText()) {
        const parentCharacterList = parentRecord.getCharacterList();
        const parentText = parentRecord.getText();
        parentTextNodeKey = generateRandomKey();

        const textNode = new ContentBlockNode({
          key: parentTextNodeKey,
          text: parentText,
          characterList: parentCharacterList,
          parent: parent,
          nextSibling: key,
        });

        acc.contentBlocks.push(textNode);

        parentRecord = parentRecord.withMutations(block => {
          block
            .set('characterList', List())
            .set('text', '')
            .set('children', parentRecord.children.push(textNode.getKey()));
        });
      }

      acc.contentBlocks[parentIndex] = parentRecord.set(
        'children',
        parentRecord.children.push(key),
      );
    }

    const blockNode = new BlockNodeRecord({
      key,
      parent,
      type,
      depth,
      text: textBlock,
      characterList,
      prevSibling:
        parentTextNodeKey ||
        (index === 0 || rawBlocks[index - 1].parent !== parent
          ? null
          : rawBlocks[index - 1].key),
      nextSibling:
        index === rawBlocks.length - 1 || rawBlocks[index + 1].parent !== parent
          ? null
          : rawBlocks[index + 1].key,
    });

    // insert node
    acc.contentBlocks.push(blockNode);

    // cache ref for building links
    acc.cacheRef[blockNode.key] = index;

    return acc;
  }, initialState).contentBlocks;
};

const convertFromHTMLToContentBlocks = (
  html: string,
  DOMBuilder: Function = getSafeBodyFromHTML,
  blockRenderMap?: DraftBlockRenderMap = DefaultDraftBlockRenderMap,
): ?{contentBlocks: ?Array<BlockNodeRecord>, entityMap: EntityMap} => {
  // Be ABSOLUTELY SURE that the dom builder you pass here won't execute
  // arbitrary code in whatever environment you're running this in. For an
  // example of how we try to do this in-browser, see getSafeBodyFromHTML.

  // TODO: replace DraftEntity with an OrderedMap here
  const chunkData = getChunkForHTML(
    html,
    DOMBuilder,
    blockRenderMap,
    DraftEntity,
  );

  if (chunkData == null) {
    return null;
  }

  const {chunk, entityMap} = chunkData;
  const contentBlocks = convertChunkToContentBlocks(chunk);

  return {
    contentBlocks,
    entityMap,
  };
};

module.exports = convertFromHTMLToContentBlocks;
