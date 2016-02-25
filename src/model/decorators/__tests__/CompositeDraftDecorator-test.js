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

jest.dontMock('CompositeDraftDecorator');

const CompositeDraftDecorator = require('CompositeDraftDecorator');

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
    return function(block, callback) {
      const text = block.getText();
      text.replace(
        regex,
        function(/*string*/ match, /*number*/ offset) {
          callback(offset, offset + match.length);
        }
      );
    };
  }

  const FooSpan = jest.genMockFn();
  const FooDecorator = {
    strategy: searchWith(/foo/gi),
    component: FooSpan,
  };

  const BarSpan = jest.genMockFn();
  const BarDecorator = {
    strategy: searchWith(/bar/gi),
    component: BarSpan,
  };

  const BartSpan = jest.genMockFn();
  const BartDecorator = {
    strategy: searchWith(/bart/gi),
    component: BartSpan,
  };

  function getCompositeDecorator() {
    const decorators = [FooDecorator, BarDecorator];
    return new CompositeDraftDecorator(decorators);
  }

  function isOccupied(arr) {
    for (let ii = 0; ii < arr.length; ii++) {
      if (arr[ii] == null) {
        return false;
      }
    }
    return true;
  }

  function isEntirelyNull(arr) {
    for (let ii = 0; ii < arr.length; ii++) {
      if (arr[ii] != null) {
        return false;
      }
    }
    return true;
  }

  it('must behave correctly if there are no matches', () => {
    const composite = getCompositeDecorator();
    const text = 'take a sad song and make it better';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();
    expect(decorations.length).toBe(text.length);
    expect(decorations).toEqual(Array(text.length).fill(null));
  });

  it('must find decoration matches', () => {
    const composite = getCompositeDecorator();
    const text = 'a footballing fool';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();
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
    const composite = getCompositeDecorator();
    const text = 'a foosball bar';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();

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
    const composite = getCompositeDecorator();
    const text = 'some bar food';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();

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
    const decorators = [BartDecorator, BarDecorator];
    const composite = new CompositeDraftDecorator(decorators);

    const text = 'bart has a bar';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();

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
    const decorators = [BarDecorator, BartDecorator];
    const composite = new CompositeDraftDecorator(decorators);

    const text = 'bart has a bar';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();

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
    const decorators = [BarDecorator];
    const composite = new CompositeDraftDecorator(decorators);

    const text = 'barbarbar';
    const content = new ContentBlock(text);
    const decorations = composite.getDecorations(content).toArray();

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
