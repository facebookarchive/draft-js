/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromHTMLToContentBlocks
 * @typechecks
 * @flow
 */

'use strict';

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DraftEntity = require('DraftEntity');
const Immutable = require('immutable');
const URI = require('URI');

const generateRandomKey = require('generateRandomKey');
const getSafeBodyFromHTML = require('getSafeBodyFromHTML');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const sanitizeDraftText = require('sanitizeDraftText');

import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';

var {
  List,
  OrderedSet,
} = Immutable;

var NBSP = '&nbsp;';
var SPACE = ' ';

// Arbitrary max indent
var MAX_DEPTH = 4;

// used for replacing characters in HTML
var REGEX_CR = new RegExp('\r', 'g');
var REGEX_LF = new RegExp('\n', 'g');
var REGEX_NBSP = new RegExp(NBSP, 'g');

// Block tag flow is different because LIs do not have
// a deterministic style ;_;
var inlineTags = {
  b: 'BOLD',
  code: 'CODE',
  del: 'STRIKETHROUGH',
  em: 'ITALIC',
  i: 'ITALIC',
  s: 'STRIKETHROUGH',
  strike: 'STRIKETHROUGH',
  strong: 'BOLD',
  u: 'UNDERLINE',
};

var lastBlock;

type Block = {
  type: DraftBlockType;
  depth: number;
};

type Chunk = {
  text: string;
  inlines: Array<DraftInlineStyle>;
  entities: Array<string>;
  blocks: Array<Block>;
  keys: Array<string>;
};

function getEmptyChunk(): Chunk {
  return {
    text: '',
    inlines: [],
    entities: [],
    blocks: [],
    keys: []
  };
}

function getWhitespaceChunk(inEntity: ?string): Chunk {
  var entities = new Array(1);
  if (inEntity) {
    entities[0] = inEntity;
  }
  return {
    text: SPACE,
    inlines: [OrderedSet()],
    entities,
    blocks: [],
    keys: []
  };
}

function getSoftNewlineChunk(): Chunk {
  return {
    text: '\n',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [],
    keys: []
  };
}

function getBlockDividerChunk(block: DraftBlockType, depth: number, key=generateRandomKey(): string): Chunk {
  return {
    text: '\r',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [{
      type: block,
      depth: Math.max(0, Math.min(MAX_DEPTH, depth)),
    }],
    keys: key ? [key] : [],
  };
}

function getListBlockType(
  tag: string,
  lastList: ?string
): ?DraftBlockType {
  if (tag === 'li') {
    return lastList === 'ol' ? 'ordered-list-item' : 'unordered-list-item';
  }
  return null;
}

function getBlockMapSupportedTags(
  blockRenderMap: DraftBlockRenderMap
): Array<string> {
  const unstyledElement = blockRenderMap.get('unstyled').element;
  return blockRenderMap
    .map((config) => config.element)
    .valueSeq()
    .toSet()
    .filter((tag) => tag !== unstyledElement)
    .toArray()
    .sort();
}

// custom element conversions
function getMultiMatchedType(
  tag: string,
  lastList: ?string,
  multiMatchExtractor: Array<Function>
): ?DraftBlockType {
  for (let ii = 0; ii < multiMatchExtractor.length; ii++) {
    const matchType = multiMatchExtractor[ii](tag, lastList);
    if (matchType) {
      return matchType;
    }
  }
  return null;
}

function getBlockTypeForTag(
  tag: string,
  lastList: ?string,
  blockRenderMap: DraftBlockRenderMap
): DraftBlockType {
  const matchedTypes = blockRenderMap
    .filter((config) => config.element === tag || config.wrapper === tag)
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
        getMultiMatchedType(tag, lastList, [getListBlockType]) ||
        'unstyled'
      );
  }
}

function processInlineTag(
  tag: string,
  node: Node,
  currentStyle: DraftInlineStyle
): DraftInlineStyle {
  var styleToCheck = inlineTags[tag];
  if (styleToCheck) {
    currentStyle = currentStyle.add(styleToCheck).toOrderedSet();
  } else if (node instanceof HTMLElement) {
    const htmlElement = node;
    currentStyle = currentStyle.withMutations(style => {
      if (htmlElement.style.fontWeight === 'bold') {
        style.add('BOLD');
      }

      if (htmlElement.style.fontStyle === 'italic') {
        style.add('ITALIC');
      }

      if (htmlElement.style.textDecoration === 'underline') {
        style.add('UNDERLINE');
      }

      if (htmlElement.style.textDecoration === 'line-through') {
        style.add('STRIKETHROUGH');
      }
    }).toOrderedSet();
  }
  return currentStyle;
}

function joinChunks(A: Chunk, B: Chunk, hasNestedBlock:boolean=false): Chunk {
  // Sometimes two blocks will touch in the DOM and we need to strip the
  // extra delimiter to preserve niceness.
  var lastInA = A.text.slice(-1);
  var firstInB = B.text.slice(0, 1);

  if (
    lastInA === '\r' &&
    firstInB === '\r' &&
    !hasNestedBlock
  ) {
    A.text = A.text.slice(0, -1);
    A.inlines.pop();
    A.entities.pop();
    A.blocks.pop();
    A.keys.pop();
  }

  // Kill whitespace after blocks
  if (
    lastInA === '\r'
  ) {
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
    keys: A.keys.concat(B.keys)
  };
}

/**
 * Check to see if we have anything like <p> <blockquote> <h1>... to create
 * block tags from. If we do, we can use those and ignore <div> tags. If we
 * don't, we can treat <div> tags as meaningful (unstyled) blocks.
 */
function containsSemanticBlockMarkup(
  html: string,
  blockTags: Array<string>
): boolean {
  return blockTags.some(tag => html.indexOf('<' + tag) !== -1);
}

function hasValidLinkText(link: Node): boolean {
  invariant(
    link instanceof HTMLAnchorElement,
    'Link must be an HTMLAnchorElement.'
  );
  var protocol = link.protocol;
  return protocol === 'http:' || protocol === 'https:';
}

function genFragment(
  node: Node,
  inlineStyle: DraftInlineStyle,
  lastList: string,
  inBlock: ?string,
  blockTags: Array<string>,
  depth: number,
  blockRenderMap: DraftBlockRenderMap,
  inEntity?: string,
  blockKey?: string
): Chunk {
  var nodeName = node.nodeName.toLowerCase();
  var newBlock = false;
  var nextBlockType = 'unstyled';
  var lastLastBlock = lastBlock;
  var isNestedElement = blockKey && blockKey.split('/').length;

  // Base Case
  if (nodeName === '#text') {
    var text = node.textContent;
    if (text.trim() === '' && inBlock !== 'pre') {
      return getWhitespaceChunk(inEntity);
    }
    if (inBlock !== 'pre') {
      // Can't use empty string because MSWord
      text = text.replace(REGEX_LF, SPACE);
    }

    // save the last block so we can use it later
    lastBlock = nodeName;

    return {
      text,
      inlines: Array(text.length).fill(inlineStyle),
      entities: Array(text.length).fill(inEntity),
      blocks: [],
      keys: []
    };
  }

  // save the last block so we can use it later
  lastBlock = nodeName;

  // BR tags
  if (nodeName === 'br') {
    if (
      lastLastBlock === 'br' &&
      (
        !inBlock ||
        getBlockTypeForTag(inBlock, lastList, blockRenderMap) === 'unstyled'
      )
    ) {
      return getBlockDividerChunk('unstyled', depth, blockKey);
    }
    return getSoftNewlineChunk();
  }

  var chunk = getEmptyChunk();
  var newChunk: ?Chunk = null;

  // Inline tags
  inlineStyle = processInlineTag(nodeName, node, inlineStyle);

  // Handle lists
  if (nodeName === 'ul' || nodeName === 'ol') {
    if (lastList) {
      depth += 1;
    }
    lastList = nodeName;
  }

  if ((!inBlock || isNestedElement) && blockTags.indexOf(nodeName) !== -1) {
    chunk = getBlockDividerChunk(
      getBlockTypeForTag(nodeName, lastList, blockRenderMap),
      depth,
      blockKey
    );
    inBlock = nodeName;
    newBlock = true;//!isNestedElement;
  } else if (lastList && inBlock === 'li' && nodeName === 'li') {
    chunk = getBlockDividerChunk(
      getBlockTypeForTag(nodeName, lastList, blockRenderMap),
      depth,
      blockKey
    );
    inBlock = nodeName;
    newBlock = true;
    nextBlockType = lastList === 'ul' ?
      'unordered-list-item' :
      'ordered-list-item';
  }

  // Recurse through children
  var child: ?Node = node.firstChild;
  if (child != null) {
    nodeName = child.nodeName.toLowerCase();
  }

  var entityId: ?string = null;
  var href: ?string = null;

  while (child) {
    if (nodeName === 'a' && child.href && hasValidLinkText(child)) {
      href = new URI(child.href).toString();
      entityId = DraftEntity.create('LINK', 'MUTABLE', {url: href});
    } else {
      entityId = undefined;
    }

    var isValidBlock = blockTags.indexOf(nodeName) !== -1;

    var chunkKey = (
      blockKey ?
        (
          isValidBlock ?  blockKey + '/' + generateRandomKey() : blockKey
        ) :
      generateRandomKey()
    );

    newChunk = genFragment(
      child,
      inlineStyle,
      lastList,
      inBlock,
      blockTags,
      depth,
      blockRenderMap,
      entityId || inEntity,
      chunkKey
    );

    chunk = joinChunks(chunk, newChunk);
    var sibling: ?Node = child.nextSibling;

    // Put in a newline to break up blocks inside blocks
    if (
      sibling &&
      blockTags.indexOf(nodeName) >= 0 &&
      inBlock
    ) {
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
      getBlockDividerChunk(nextBlockType, depth, blockKey ? blockKey + '/' + generateRandomKey() : generateRandomKey())
    );
  }

  return chunk;
}

function getChunkForHTML(
  html: string,
  DOMBuilder: Function,
  blockRenderMap: DraftBlockRenderMap
): ?Chunk {
  html = html
    .trim()
    .replace(REGEX_CR, '')
    .replace(REGEX_NBSP, SPACE);

  const supportedBlockTags = getBlockMapSupportedTags(blockRenderMap);

  var safeBody = DOMBuilder(html);
  if (!safeBody) {
    return null;
  }
  lastBlock = null;

  // Sometimes we aren't dealing with content that contains nice semantic
  // tags. In this case, use divs to separate everything out into paragraphs
  // and hope for the best.
  var workingBlocks = containsSemanticBlockMarkup(html, supportedBlockTags) ?
    supportedBlockTags :
    ['div'];

  // Start with -1 block depth to offset the fact that we are passing in a fake
  // UL block to start with.
  var chunk = genFragment(
    safeBody,
    OrderedSet(),
    'ul',
    null,
    workingBlocks,
    -1,
    blockRenderMap
  );


  // join with previous block to prevent weirdness on paste
  if (chunk.text.indexOf('\r') === 0) {
    chunk = {
      text: chunk.text.slice(1),
      inlines: chunk.inlines.slice(1),
      entities: chunk.entities.slice(1),
      blocks: chunk.blocks,
      keys: chunk.keys
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
    chunk.blocks.push({type: 'unstyled', depth: 0});
  }

  // Sometimes we start with text that isn't in a block, which is then
  // followed by blocks. Need to fix up the blocks to add in
  // an unstyled block for this content
  if (chunk.text.split('\r').length === chunk.blocks.length + 1) {
    chunk.blocks.unshift({type: 'unstyled', depth: 0});
  }

  return chunk;
}

function convertFromHTMLtoContentBlocks(
  html: string,
  DOMBuilder: Function = getSafeBodyFromHTML,
  blockRenderMap?: DraftBlockRenderMap = DefaultDraftBlockRenderMap,
): ?Array<ContentBlock> {
  // Be ABSOLUTELY SURE that the dom builder you pass here won't execute
  // arbitrary code in whatever environment you're running this in. For an
  // example of how we try to do this in-browser, see getSafeBodyFromHTML.

  var chunk = getChunkForHTML(html, DOMBuilder, blockRenderMap);

  if (chunk == null) {
    return null;
  }
  var start = 0;

  var contentBlocks = chunk.text.split('\r').map(
    (textBlock, ii) => {
      // Make absolutely certain that our text is acceptable.
      textBlock = sanitizeDraftText(textBlock);
      var end = start + textBlock.length;
      var inlines = nullthrows(chunk).inlines.slice(start, end);
      var entities = nullthrows(chunk).entities.slice(start, end);
      var characterList = List(
        inlines.map((style, ii) => {
          var data = {style, entity: (null: ?string)};
          if (entities[ii]) {
            data.entity = entities[ii];
          }
          return CharacterMetadata.create(data);
        })
      );
      start = end + 1;

      var blockType = nullthrows(chunk).blocks[ii].type;
      var blockConfig = blockRenderMap.get(blockType);
      var key = blockConfig && blockConfig.nestingEnabled ?
        nullthrows(chunk).keys[ii] :
        null;

      var blockConfig = {
        key: key || generateRandomKey(),
        type: blockType,
        depth: nullthrows(chunk).blocks[ii].depth,
        text: textBlock,
        characterList,
      };

      //console.log("=========");
      //console.log(JSON.stringify(blockConfig, null, 2));
      //console.log("Key used on the block is :", chunk.keys[ii]);
      //console.log("Key used on the block is :", chunk.blocks[ii].type);
      //console.log("=========");

      return new ContentBlock(blockConfig);
    }
  );

  console.log(JSON.stringify(contentBlocks, null, 2));
  //
  return contentBlocks;
}

module.exports = convertFromHTMLtoContentBlocks;
