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

const {Set} = require('immutable');

import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {DraftBlockRenderConfig} from 'DraftBlockRenderConfig';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {EntityMap} from 'EntityMap';

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
var REGEX_CARRIAGE = new RegExp('&#13;?', 'g');
var REGEX_ZWS = new RegExp('&#8203;?', 'g');

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
const boldValues = ['bold', 'bolder', '500', '600', '700', '800', '900'];
const notBoldValues = ['light', 'lighter', '100', '200', '300', '400'];

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

var anchorAttr = [
  'className',
  'href',
  'rel',
  'target',
  'title',
];

const imgAttr = [
  'alt',
  'className',
  'height',
  'src',
  'width',
];

var lastBlock;

type Block = {
  type: DraftBlockType,
  depth: number,
};

type Chunk = {
  text: string,
  inlines: Array<DraftInlineStyle>,
  entities: Array<string>,
  blocks: Array<Block>,
};

function getEmptyChunk(): Chunk {
  return {
    text: '',
    inlines: [],
    entities: [],
    blocks: [],
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
  };
}

function getSoftNewlineChunk(): Chunk {
  return {
    text: '\n',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [],
  };
}

function getBlockDividerChunk(block: DraftBlockType, depth: number): Chunk {
  return {
    text: '\r',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [{
      type: block,
      depth: Math.max(0, Math.min(MAX_DEPTH, depth)),
    }],
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
  let tags = new Set([]);

  blockRenderMap.forEach((draftBlock: DraftBlockRenderConfig) => {
    if (draftBlock.aliasedElements) {
      draftBlock.aliasedElements.forEach((tag) => {
        tags = tags.add(tag);
      });
    }

    tags = tags.add(draftBlock.element);
  });

  return tags
    .filter((tag) => tag && tag !== unstyledElement)
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
    .filter((draftBlock: DraftBlockRenderConfig) => (
      draftBlock.element === tag ||
      draftBlock.wrapper === tag ||
      (
        draftBlock.aliasedElements &&
        draftBlock.aliasedElements.some(alias => alias === tag)
      )
    ))
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
    }).toOrderedSet();
  }
  return currentStyle;
}

function joinChunks(A: Chunk, B: Chunk): Chunk {
  // Sometimes two blocks will touch in the DOM and we need to strip the
  // extra delimiter to preserve niceness.
  var lastInA = A.text.slice(-1);
  var firstInB = B.text.slice(0, 1);

  if (
    lastInA === '\r' &&
    firstInB === '\r'
  ) {
    A.text = A.text.slice(0, -1);
    A.inlines.pop();
    A.entities.pop();
    A.blocks.pop();
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
  return (
    protocol === 'http:' ||
    protocol === 'https:' ||
    protocol === 'mailto:'
  );
}

function genFragment(
  entityMap: EntityMap,
  node: Node,
  inlineStyle: DraftInlineStyle,
  lastList: string,
  inBlock: ?string,
  blockTags: Array<string>,
  depth: number,
  blockRenderMap: DraftBlockRenderMap,
  inEntity?: string
): {chunk: Chunk, entityMap: EntityMap} {
  var nodeName = node.nodeName.toLowerCase();
  var newBlock = false;
  var nextBlockType = 'unstyled';
  var lastLastBlock = lastBlock;
  let newEntityMap = entityMap;

  // Base Case
  if (nodeName === '#text') {
    var text = node.textContent;
    if (text.trim() === '' && inBlock !== 'pre') {
      return {chunk: getWhitespaceChunk(inEntity), entityMap};
    }
    if (inBlock !== 'pre') {
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
    if (
      lastLastBlock === 'br' &&
      (
        !inBlock ||
        getBlockTypeForTag(inBlock, lastList, blockRenderMap) === 'unstyled'
      )
    ) {
      return {chunk: getBlockDividerChunk('unstyled', depth), entityMap};
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

    imgAttr.forEach((attr) => {
      const imageAttribute = image.getAttribute(attr);
      if (imageAttribute) {
        entityConfig[attr] = imageAttribute;
      }
    });
    const imageURI = new URI(entityConfig.src).toString();
    node.textContent = imageURI; // Output src if no decorator

    // TODO: update this when we remove DraftEntity entirely
    inEntity = DraftEntity.__create(
      'IMAGE',
      'MUTABLE',
      entityConfig || {},
    );
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

  // Block Tags
  if (!inBlock && blockTags.indexOf(nodeName) !== -1) {
    chunk = getBlockDividerChunk(
      getBlockTypeForTag(nodeName, lastList, blockRenderMap),
      depth
    );
    inBlock = nodeName;
    newBlock = true;
  } else if (lastList && inBlock === 'li' && nodeName === 'li') {
    chunk = getBlockDividerChunk(
      getBlockTypeForTag(nodeName, lastList, blockRenderMap),
      depth
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

  while (child) {
    if (
      child instanceof HTMLAnchorElement &&
      child.href &&
      hasValidLinkText(child)
    ) {
      const anchor: HTMLAnchorElement = child;
      const entityConfig = {};

      anchorAttr.forEach((attr) => {
        const anchorAttribute = anchor.getAttribute(attr);
        if (anchorAttribute) {
          entityConfig[attr] = anchorAttribute;
        }
      });

      entityConfig.url = new URI(anchor.href).toString();
      // TODO: update this when we remove DraftEntity completely
      entityId = DraftEntity.__create(
        'LINK',
        'MUTABLE',
        entityConfig || {},
      );
    } else {
      entityId = undefined;
    }

    const { chunk: generatedChunk, entityMap: maybeUpdatedEntityMap } = genFragment(
      newEntityMap,
      child,
      inlineStyle,
      lastList,
      inBlock,
      blockTags,
      depth,
      blockRenderMap,
      entityId || inEntity
    );

    newChunk = generatedChunk;
    newEntityMap = maybeUpdatedEntityMap;

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
      getBlockDividerChunk(nextBlockType, depth)
    );
  }

  return {chunk, entityMap: newEntityMap};
}

function getChunkForHTML(
  html: string,
  DOMBuilder: Function,
  blockRenderMap: DraftBlockRenderMap,
  entityMap: EntityMap,
): ?{chunk: Chunk, entityMap: EntityMap} {
  html = html
    .trim()
    .replace(REGEX_CR, '')
    .replace(REGEX_NBSP, SPACE)
    .replace(REGEX_CARRIAGE, '')
    .replace(REGEX_ZWS, '');

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
  var {
    chunk,
    entityMap: newEntityMap,
  } = genFragment(
    entityMap,
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

  return {chunk, entityMap: newEntityMap};
}

function convertFromHTMLtoContentBlocks(
  html: string,
  DOMBuilder: Function = getSafeBodyFromHTML,
  blockRenderMap?: DraftBlockRenderMap = DefaultDraftBlockRenderMap,
): ?{contentBlocks: ?Array<ContentBlock>, entityMap: EntityMap} {
  // Be ABSOLUTELY SURE that the dom builder you pass here won't execute
  // arbitrary code in whatever environment you're running this in. For an
  // example of how we try to do this in-browser, see getSafeBodyFromHTML.

  // TODO: replace DraftEntity with an OrderedMap here
  var chunkData = getChunkForHTML(html, DOMBuilder, blockRenderMap, DraftEntity);

  if (chunkData == null) {
    return null;
  }

  const {
    chunk,
    entityMap: newEntityMap,
  } = chunkData;

  var start = 0;
  return {
    contentBlocks: chunk.text.split('\r').map(
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
          }),
        );
        start = end + 1;

        return new ContentBlock({
          key: generateRandomKey(),
          type: nullthrows(chunk).blocks[ii].type,
          depth: nullthrows(chunk).blocks[ii].depth,
          text: textBlock,
          characterList,
        });
      },
    ),
    entityMap: newEntityMap,
  };
}

module.exports = convertFromHTMLtoContentBlocks;
