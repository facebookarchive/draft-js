/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 * @typechecks
 */

jest.unmock('CompositeDraftDecorator');

var CompositeDraftDecorator = require('CompositeDraftDecorator');
const ContentState = require('ContentState');

describe('CompositeDraftDecorator', () => {
  class ContentBlock {
    constructor(/*string*/ text) {
      this._text = text;
    }
    getText() /*string*/ {
      return this._text;
    }
  }

  function searchWith(regex) {
    return function(contentState, block, callback) {
      var text = block.getText();
      text.replace(
        regex,
        function(/*string*/ match, /*number*/ offset) {
          callback(offset, offset + match.length);
        }
      );
    };
  }

  var FooSpan = jest.fn();
  var FooDecorator = {
    strategy: searchWith(/foo/gi),
    component: FooSpan,
  };

  var BarSpan = jest.fn();
  var BarDecorator = {
    strategy: searchWith(/bar/gi),
    component: BarSpan,
  };

  var BartSpan = jest.fn();
  var BartDecorator = {
    strategy: searchWith(/bart/gi),
    component: BartSpan,
  };

  function getCompositeDecorator() {
    var decorators = [FooDecorator, BarDecorator];
    return new CompositeDraftDecorator(decorators);
  }

  function isOccupied(arr) {
    for (var ii = 0; ii < arr.length; ii++) {
      if (arr[ii] == null) {
        return false;
      }
    }
    return true;
  }

  function isEntirelyNull(arr) {
    for (var ii = 0; ii < arr.length; ii++) {
      if (arr[ii] != null) {
        return false;
      }
    }
    return true;
  }

  it('must behave correctly if there are no matches', () => {
    var composite = getCompositeDecorator();
    var text = 'take a sad song and make it better';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();
    expect(decorations.length).toBe(text.length);
    expect(decorations).toEqual(Array(text.length).fill(null));
  });

  it('must find decoration matches', () => {
    var composite = getCompositeDecorator();
    var text = 'a footballing fool';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();
    expect(decorations.length).toBe(text.length);

    expect(isOccupied(decorations.slice(2, 5))).toBe(true);
    expect(decorations[2]).toEqual(decorations[4]);
    expect(composite.getComponentForKey(decorations[2])).toBe(FooSpan);

    expect(isEntirelyNull(decorations.slice(5, 14))).toBe(true);

    expect(isOccupied(decorations.slice(14, 17))).toBe(true);
    expect(decorations[14]).toEqual(decorations[16]);
    expect(composite.getComponentForKey(decorations[14])).toBe(FooSpan);
  });

  it('must find matches for multiple decorators', () => {
    var composite = getCompositeDecorator();
    var text = 'a foosball bar';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();

    // Match the "Foo" decorator.
    expect(isOccupied(decorations.slice(2, 5))).toBe(true);
    expect(decorations[2]).toEqual(decorations[4]);
    expect(composite.getComponentForKey(decorations[2])).toBe(FooSpan);

    expect(isEntirelyNull(decorations.slice(5, 11))).toBe(true);

    // Match the "Bar" decorator.
    expect(isOccupied(decorations.slice(11, 14))).toBe(true);
    expect(decorations[11]).toEqual(decorations[13]);
    expect(composite.getComponentForKey(decorations[11])).toBe(BarSpan);
  });

  // Reverse the order of the matches from above. "foo" comes after "bar" in
  // the document text.
  it('must find matches regardless of text location', () => {
    var composite = getCompositeDecorator();
    var text = 'some bar food';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();

    // Match the "Foo" decorator.
    expect(isOccupied(decorations.slice(9, 12))).toBe(true);
    expect(decorations[9]).toEqual(decorations[11]);
    expect(composite.getComponentForKey(decorations[9])).toBe(FooSpan);

    // Match the "Bar" decorator.
    expect(isOccupied(decorations.slice(5, 8))).toBe(true);
    expect(decorations[5]).toEqual(decorations[7]);
    expect(composite.getComponentForKey(decorations[5])).toBe(BarSpan);
  });

  it('must throw out overlaps with existing decorations', () => {
    var decorators = [BartDecorator, BarDecorator];
    var composite = new CompositeDraftDecorator(decorators);

    var text = 'bart has a bar';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();

    // Even though "bart" matches our "bar" strategy, "bart" comes first
    // in our decoration order and will claim those letters first.
    expect(isOccupied(decorations.slice(0, 4))).toBe(true);
    expect(decorations[0]).toEqual(decorations[3]);
    expect(composite.getComponentForKey(decorations[0])).toBe(BartSpan);

    // Verify empty space between matches.
    expect(isEntirelyNull(decorations.slice(4, 11))).toBe(true);

    // "bar" match
    expect(isOccupied(decorations.slice(11, 14))).toBe(true);
    expect(decorations[11]).toEqual(decorations[13]);
    expect(composite.getComponentForKey(decorations[11])).toBe(BarSpan);
  });

  // Swap the order of "bar" and "bart".
  it('must throw out matches if earlier match is shorter', () => {
    var decorators = [BarDecorator, BartDecorator];
    var composite = new CompositeDraftDecorator(decorators);

    var text = 'bart has a bar';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();

    // "bar" comes first and claims two strings.
    expect(isOccupied(decorations.slice(0, 3))).toBe(true);
    expect(decorations[0]).toEqual(decorations[2]);
    expect(composite.getComponentForKey(decorations[0])).toBe(BarSpan);

    expect(isOccupied(decorations.slice(11, 14))).toBe(true);
    expect(decorations[11]).toEqual(decorations[13]);
    expect(composite.getComponentForKey(decorations[11])).toBe(BarSpan);

    // There are no "bart" matches, since "bar" has claimed the relevant
    // strings.
    expect(isEntirelyNull(decorations.slice(3, 11))).toBe(true);
  });

  it('must separate adjacent ranges that have the same decorator', () => {
    var decorators = [BarDecorator];
    var composite = new CompositeDraftDecorator(decorators);

    var text = 'barbarbar';
    var content = new ContentBlock(text);
    var contentState = ContentState.createFromText(text);
    var decorations = composite.getDecorations(contentState, content).toArray();

    expect(isOccupied(decorations.slice(0, 3))).toBe(true);
    expect(decorations[0]).toEqual(decorations[2]);
    expect(composite.getComponentForKey(decorations[0])).toBe(BarSpan);

    expect(isOccupied(decorations.slice(3, 6))).toBe(true);
    expect(decorations[3]).toEqual(decorations[5]);
    expect(composite.getComponentForKey(decorations[3])).toBe(BarSpan);

    expect(isOccupied(decorations.slice(6, 9))).toBe(true);
    expect(decorations[6]).toEqual(decorations[8]);
    expect(composite.getComponentForKey(decorations[6])).toBe(BarSpan);

    expect(decorations[2]).not.toEqual(decorations[3]);
    expect(decorations[5]).not.toEqual(decorations[6]);
    expect(decorations[8]).not.toEqual(decorations[9]);
  });
});
