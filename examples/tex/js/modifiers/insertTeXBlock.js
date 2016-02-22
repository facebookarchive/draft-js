/**
 * Copyright (c) 2013-present, Facebook, Inc. All rights reserved.
 *
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

import {List, Repeat} from 'immutable';
import {
  BlockMapBuilder,
  CharacterMetadata,
  ContentBlock,
  EditorState,
  Entity,
  Modifier,
  genKey,
} from 'draft-js';

var count = 0;
var examples = [
  '\\int_a^bu\\frac{d^2v}{dx^2}\\,dx\n' +
  '=\\left.u\\frac{dv}{dx}\\right|_a^b\n' +
  '-\\int_a^b\\frac{du}{dx}\\frac{dv}{dx}\\,dx',

  'P(E) = {n \\choose k} p^k (1-p)^{ n-k} ',

  '\\tilde f(\\omega)=\\frac{1}{2\\pi}\n' +
  '\\int_{-\\infty}^\\infty f(x)e^{-i\\omega x}\\,dx',

  '\\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} =\n' +
  '1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}}\n' +
  '{1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }',
];

export function insertTeXBlock(editorState) {
  var contentState = editorState.getCurrentContent();
  var selectionState = editorState.getSelection();

  var afterRemoval = Modifier.removeRange(
    contentState,
    selectionState,
    'backward'
  );

  var targetSelection = afterRemoval.getSelectionAfter();
  var afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
  var insertionTarget = afterSplit.getSelectionAfter();

  var asMedia = Modifier.setBlockType(afterSplit, insertionTarget, 'media');
  var nextFormula = count++ % examples.length;

  var entityKey = Entity.create(
    'TOKEN',
    'IMMUTABLE',
    {content: examples[nextFormula]}
  );

  var charData = CharacterMetadata.create({entity: entityKey});

  var fragmentArray = [
    new ContentBlock({
      key: genKey(),
      type: 'media',
      text: ' ',
      characterList: List(Repeat(charData, 1)),
    }),
    new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: '',
      characterList: List(),
    }),
  ];

  var fragment = BlockMapBuilder.createFromArray(fragmentArray);

  var withMedia = Modifier.replaceWithFragment(
    asMedia,
    insertionTarget,
    fragment
  );

  var newContent = withMedia.merge({
    selectionBefore: selectionState,
    selectionAfter: withMedia.getSelectionAfter().set('hasFocus', true),
  });

  return EditorState.push(editorState, newContent, 'insert-fragment');
}
