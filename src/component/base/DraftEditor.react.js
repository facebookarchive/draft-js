/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @preventMunge
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {DraftEditorModes} from 'DraftEditorModes';
import type {DraftEditorDefaultProps, DraftEditorProps} from 'DraftEditorProps';
import type {DraftScrollPosition} from 'DraftScrollPosition';

const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DefaultDraftInlineStyle = require('DefaultDraftInlineStyle');
const DraftEditorCompositionHandler = require('DraftEditorCompositionHandler');
const DraftEditorContents = require('DraftEditorContents.react');
const DraftEditorDragHandler = require('DraftEditorDragHandler');
const DraftEditorEditHandler = require('DraftEditorEditHandler');
const flushControlled = require('DraftEditorFlushControlled');
const DraftEditorPlaceholder = require('DraftEditorPlaceholder.react');
const DraftEffects = require('DraftEffects');
const EditorState = require('EditorState');
const Scroll = require('Scroll');
const Style = require('Style');
const UserAgent = require('UserAgent');

const cx = require('cx');
const generateRandomKey = require('generateRandomKey');
const getDefaultKeyBinding = require('getDefaultKeyBinding');
const getScrollPosition = require('getScrollPosition');
const gkx = require('gkx');
const invariant = require('invariant');
const isHTMLElement = require('isHTMLElement');
const nullthrows = require('nullthrows');
const React = require('react');

const isIE = UserAgent.isBrowser('IE');

// IE does not support the `input` event on contentEditable, so we can't
// observe spellcheck behavior.
const allowSpellCheck = !isIE;

// Define a set of handler objects to correspond to each possible `mode`
// of editor behavior.
const handlerMap = {
  edit: DraftEditorEditHandler,
  composite: DraftEditorCompositionHandler,
  drag: DraftEditorDragHandler,
  cut: null,
  render: null,
};

type State = {contentsKey: number};

let didInitODS = false;

class UpdateDraftEditorFlags extends React.Component<{
  editor: DraftEditor,
  editorState: EditorState,
}> {
  render(): React.Node {
    return null;
  }
  componentDidMount(): mixed {
    this._update();
  }
  componentDidUpdate(): mixed {
    this._update();
  }
  _update() {
    const editor = this.props.editor;
    /**
     * Sometimes a render triggers a 'focus' or other event, and that will
     * schedule a second render pass.
     * In order to make sure the second render pass gets the latest editor
     * state, we update it here.
     * Example:
     * render #1
     * +
     * |
     * | cWU -> Nothing ... latestEditorState = STALE_STATE :(
     * |
     * | render -> this.props.editorState = FRESH_STATE
     * | +         *and* set latestEditorState = FRESH_STATE
     *   |
     * | |
     * | +--> triggers 'focus' event, calling 'handleFocus' with latestEditorState
     * |                                                +
     * |                                                |
     * +>cdU -> latestEditorState = FRESH_STATE         | the 'handleFocus' call schedules render #2
     *                                                  | with latestEditorState, which is FRESH_STATE
     *                                                  |
     * render #2 <--------------------------------------+
     * +
     * |
     * | cwU -> nothing updates
     * |
     * | render -> this.props.editorState = FRESH_STATE which was passed in above
     * |
     * +>cdU fires and resets latestEditorState = FRESH_STATE
     * ---
     * Note that if we don't set latestEditorState in 'render' in the above
     * diagram, then STALE_STATE gets passed to render #2.
     */
    editor._latestEditorState = this.props.editorState;

    /**
     * The reason we set this 'blockSelectEvents' flag is that  IE will fire a
     * 'selectionChange' event when we programmatically change the selection,
     * meaning it would trigger a new select event while we are in the middle
     * of updating.
     * We found that the 'selection.addRange' was what triggered the stray
     * selectionchange event in IE.
     * To be clear - we have not been able to reproduce specific bugs related
     * to this stray selection event, but have recorded logs that some
     * conditions do cause it to get bumped into during editOnSelect.
     */
    editor._blockSelectEvents = true;
  }
}

const EDITOR_ID_PLACEHOLDER = '{{editor_id_placeholder}}';

/**
 * `DraftEditor` is the root editor component. It composes a `contentEditable`
 * div, and provides a wide variety of useful function props for managing the
 * state of the editor. See `DraftEditorProps` for details.
 */
class DraftEditor extends React.Component<DraftEditorProps, State> {
  static defaultProps: DraftEditorDefaultProps = {
    ariaDescribedBy: EDITOR_ID_PLACEHOLDER,
    blockRenderMap: DefaultDraftBlockRenderMap,
    blockRendererFn() {
      return null;
    },
    blockStyleFn() {
      return '';
    },
    keyBindingFn: getDefaultKeyBinding,
    readOnly: false,
    spellCheck: false,
    stripPastedStyles: false,
  };

  _blockSelectEvents: boolean;
  _clipboard: ?BlockMap;
  _handler: ?Object;
  _dragCount: number;
  _internalDrag: boolean = false;
  _editorKey: string;
  _placeholderAccessibilityID: string;
  _latestEditorState: EditorState;
  _latestCommittedEditorState: EditorState;
  _pendingStateFromBeforeInput: void | EditorState;

  /**
   * Define proxies that can route events to the current handler.
   */
  _onBeforeInput: Function;
  _onBlur: Function;
  _onCharacterData: Function;
  _onCompositionEnd: Function;
  _onCompositionStart: Function;
  _onCopy: Function;
  _onCut: Function;
  _onDragEnd: Function;
  _onDragOver: Function;
  _onDragStart: Function;
  _onDrop: Function;
  _onInput: Function;
  _onFocus: Function;
  _onKeyDown: Function;
  _onKeyPress: Function;
  _onKeyUp: Function;
  _onMouseDown: Function;
  _onMouseUp: Function;
  _onPaste: Function;
  _onSelect: Function;

  editor: ?HTMLElement;
  editorContainer: ?HTMLElement;
  getEditorKey: () => string;
  // See `restoreEditorDOM()`.
  state: State = {contentsKey: 0};

  constructor(props: DraftEditorProps) {
    super(props);

    this._blockSelectEvents = false;
    this._clipboard = null;
    this._handler = null;
    this._dragCount = 0;
    this._editorKey = props.editorKey || generateRandomKey();
    this._placeholderAccessibilityID = 'placeholder-' + this._editorKey;
    this._latestEditorState = props.editorState;
    this._latestCommittedEditorState = props.editorState;

    this._onBeforeInput = this._buildHandler('onBeforeInput');
    this._onBlur = this._buildHandler('onBlur');
    this._onCharacterData = this._buildHandler('onCharacterData');
    this._onCompositionEnd = this._buildHandler('onCompositionEnd');
    this._onCompositionStart = this._buildHandler('onCompositionStart');
    this._onCopy = this._buildHandler('onCopy');
    this._onCut = this._buildHandler('onCut');
    this._onDragEnd = this._buildHandler('onDragEnd');
    this._onDragOver = this._buildHandler('onDragOver');
    this._onDragStart = this._buildHandler('onDragStart');
    this._onDrop = this._buildHandler('onDrop');
    this._onInput = this._buildHandler('onInput');
    this._onFocus = this._buildHandler('onFocus');
    this._onKeyDown = this._buildHandler('onKeyDown');
    this._onKeyPress = this._buildHandler('onKeyPress');
    this._onKeyUp = this._buildHandler('onKeyUp');
    this._onMouseDown = this._buildHandler('onMouseDown');
    this._onMouseUp = this._buildHandler('onMouseUp');
    this._onPaste = this._buildHandler('onPaste');
    this._onSelect = this._buildHandler('onSelect');

    this.getEditorKey = () => this._editorKey;

    if (__DEV__) {
      [
        'onDownArrow',
        'onEscape',
        'onLeftArrow',
        'onRightArrow',
        'onTab',
        'onUpArrow',
      ].forEach(propName => {
        if (props.hasOwnProperty(propName)) {
          // eslint-disable-next-line fb-www/no-console
          console.warn(
            `Supplying an \`${propName}\` prop to \`DraftEditor\` has ` +
              'been deprecated. If your handler needs access to the keyboard ' +
              'event, supply a custom `keyBindingFn` prop that falls back to ' +
              'the default one (eg. https://is.gd/wHKQ3W).',
          );
        }
      });
    }
  }

  /**
   * Build a method that will pass the event to the specified handler method.
   * This allows us to look up the correct handler function for the current
   * editor mode, if any has been specified.
   */
  _buildHandler(eventName: string): Function {
    // Wrap event handlers in `flushControlled`. In sync mode, this is
    // effectively a no-op. In async mode, this ensures all updates scheduled
    // inside the handler are flushed before React yields to the browser.
    return e => {
      if (!this.props.readOnly) {
        const method = this._handler && this._handler[eventName];
        if (method) {
          if (flushControlled) {
            flushControlled(() => method(this, e));
          } else {
            method(this, e);
          }
        }
      }
    };
  }

  _handleEditorContainerRef: (HTMLElement | null) => void = (
    node: HTMLElement | null,
  ): void => {
    this.editorContainer = node;
    // Instead of having a direct ref on the child, we'll grab it here.
    // This is safe as long as the rendered structure is static (which it is).
    // This lets the child support ref={props.editorRef} without merging refs.
    this.editor = node !== null ? (node: any).firstChild : null;
  };

  _showPlaceholder(): boolean {
    return (
      !!this.props.placeholder &&
      !this.props.editorState.isInCompositionMode() &&
      !this.props.editorState.getCurrentContent().hasText()
    );
  }

  _renderPlaceholder(): React.Node {
    if (this._showPlaceholder()) {
      const placeHolderProps = {
        ariaHidden: this.props.placeholderAriaHidden,
        accessibilityID: this._placeholderAccessibilityID,
        className: this.props.placeholderClassName,
        editorState: this.props.editorState,
        text: nullthrows(this.props.placeholder),
        textAlignment: this.props.textAlignment,
      };

      /* $FlowFixMe[incompatible-type] (>=0.112.0 site=www,mobile) This comment
       * suppresses an error found when Flow v0.112 was deployed. To see the
       * error delete this comment and run Flow. */
      return <DraftEditorPlaceholder {...placeHolderProps} />;
    }
    return null;
  }

  /**
   * returns ariaDescribedBy prop with EDITOR_ID_PLACEHOLDER replaced with
   * the DOM id of the placeholder (if it exists)
   * @returns aria-describedby attribute value
   */
  _renderARIADescribedBy(): ?string {
    const describedBy = this.props.ariaDescribedBy || '';
    if (this.props.placeholderAriaHidden) {
      return describedBy === EDITOR_ID_PLACEHOLDER ? undefined : describedBy;
    }
    const placeholderID = this._showPlaceholder()
      ? this._placeholderAccessibilityID
      : '';
    return (
      describedBy.replace(EDITOR_ID_PLACEHOLDER, placeholderID) || undefined
    );
  }

  render(): React.Node {
    const {
      blockRenderMap,
      blockRendererFn,
      blockStyleFn,
      customStyleFn,
      customStyleMap,
      editorState,
      preventScroll,
      readOnly,
      textAlignment,
      textDirectionality,
    } = this.props;

    const rootClass = cx({
      'DraftEditor/root': true,
      'DraftEditor/alignLeft': textAlignment === 'left',
      'DraftEditor/alignRight': textAlignment === 'right',
      'DraftEditor/alignCenter': textAlignment === 'center',
    });

    const contentStyle = {
      outline: 'none',
      // fix parent-draggable Safari bug. #1326
      userSelect: 'text',
      WebkitUserSelect: 'text',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    };

    // The aria-expanded and aria-haspopup properties should only be rendered
    // for a combobox.
    /* $FlowFixMe[prop-missing] (>=0.68.0 site=www,mobile) This comment
     * suppresses an error found when Flow v0.68 was deployed. To see the error
     * delete this comment and run Flow. */
    const ariaRole = this.props.role || 'textbox';
    const ariaExpanded =
      ariaRole === 'combobox' ? !!this.props.ariaExpanded : null;

    const editorContentsProps = {
      blockRenderMap,
      blockRendererFn,
      blockStyleFn,
      customStyleMap: {
        ...DefaultDraftInlineStyle,
        ...customStyleMap,
      },
      customStyleFn,
      editorKey: this._editorKey,
      editorState,
      preventScroll,
      textDirectionality,
    };

    const contentClassName =
      this.props.contentClassName != null
        ? this.props.contentClassName + ' '
        : '';

    return (
      <div className={rootClass}>
        {this._renderPlaceholder()}
        <div
          className={cx('DraftEditor/editorContainer')}
          ref={this._handleEditorContainerRef}>
          {/* Note: _handleEditorContainerRef assumes this div won't move: */}
          <div
            aria-activedescendant={
              readOnly ? null : this.props.ariaActiveDescendantID
            }
            aria-autocomplete={readOnly ? null : this.props.ariaAutoComplete}
            aria-controls={readOnly ? null : this.props.ariaControls}
            aria-describedby={this._renderARIADescribedBy()}
            aria-expanded={readOnly ? null : ariaExpanded}
            aria-label={this.props.ariaLabel ?? this.props.placeholder}
            aria-labelledby={this.props.ariaLabelledBy}
            aria-multiline={this.props.ariaMultiline}
            aria-owns={readOnly ? null : this.props.ariaOwneeID}
            aria-required={this.props.ariaRequired}
            autoCapitalize={this.props.autoCapitalize}
            autoComplete={this.props.autoComplete}
            autoCorrect={this.props.autoCorrect}
            className={
              // eslint-disable-next-line fb-www/cx-concat
              contentClassName +
              cx({
                // Chrome's built-in translation feature mutates the DOM in ways
                // that Draft doesn't expect (ex: adding <font> tags inside
                // DraftEditorLeaf spans) and causes problems. We add notranslate
                // here which makes its autotranslation skip over this subtree.
                notranslate: !readOnly,
                'public/DraftEditor/content': true,
              })
            }
            contentEditable={!readOnly}
            data-testid={this.props.webDriverTestID}
            onBeforeInput={this._onBeforeInput}
            onBlur={this._onBlur}
            onCompositionEnd={this._onCompositionEnd}
            onCompositionStart={this._onCompositionStart}
            onCopy={this._onCopy}
            onCut={this._onCut}
            onDragEnd={this._onDragEnd}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDragOver={this._onDragOver}
            onDragStart={this._onDragStart}
            onDrop={this._onDrop}
            onFocus={this._onFocus}
            onInput={this._onInput}
            onKeyDown={this._onKeyDown}
            onKeyPress={this._onKeyPress}
            onKeyUp={this._onKeyUp}
            onMouseDown={this._onMouseDown}
            onMouseUp={this._onMouseUp}
            onPaste={this._onPaste}
            onSelect={this._onSelect}
            ref={this.props.editorRef}
            role={readOnly ? null : ariaRole}
            spellCheck={allowSpellCheck && this.props.spellCheck}
            style={contentStyle}
            suppressContentEditableWarning
            tabIndex={this.props.tabIndex}>
            {/*
              Needs to come earlier in the tree as a sibling (not ancestor) of
              all DraftEditorLeaf nodes so it's first in postorder traversal.
            */}
            <UpdateDraftEditorFlags editor={this} editorState={editorState} />
            <DraftEditorContents
              {...editorContentsProps}
              key={'contents' + this.state.contentsKey}
            />
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(): void {
    this._blockSelectEvents = false;
    if (!didInitODS && gkx('draft_ods_enabled')) {
      didInitODS = true;
      DraftEffects.initODS();
    }
    this.setMode('edit');

    /**
     * IE has a hardcoded "feature" that attempts to convert link text into
     * anchors in contentEditable DOM. This breaks the editor's expectations of
     * the DOM, and control is lost. Disable it to make IE behave.
     * See: http://blogs.msdn.com/b/ieinternals/archive/2010/09/15/
     * ie9-beta-minor-change-list.aspx
     */
    if (isIE) {
      // editor can be null after mounting
      // https://stackoverflow.com/questions/44074747/componentdidmount-called-before-ref-callback
      if (!this.editor) {
        global.execCommand('AutoUrlDetect', false, false);
      } else {
        this.editor.ownerDocument.execCommand('AutoUrlDetect', false, false);
      }
    }
  }

  componentDidUpdate(): void {
    this._blockSelectEvents = false;
    this._latestEditorState = this.props.editorState;
    this._latestCommittedEditorState = this.props.editorState;
  }

  /**
   * Used via `this.focus()`.
   *
   * Force focus back onto the editor node.
   *
   * We attempt to preserve scroll position when focusing. You can also pass
   * a specified scroll position (for cases like `cut` behavior where it should
   * be restored to a known position).
   */
  // eslint-disable-next-line fb-www/extra-arrow-initializer
  focus: (scrollPosition?: DraftScrollPosition) => void = (
    scrollPosition?: DraftScrollPosition,
  ): void => {
    const {editorState} = this.props;
    const alreadyHasFocus = editorState.getSelection().getHasFocus();
    const editorNode = this.editor;

    if (!editorNode) {
      // once in a while people call 'focus' in a setTimeout, and the node has
      // been deleted, so it can be null in that case.
      return;
    }

    const scrollParent = Style.getScrollParent(editorNode);
    const {x, y} = scrollPosition || getScrollPosition(scrollParent);

    invariant(isHTMLElement(editorNode), 'editorNode is not an HTMLElement');

    editorNode.focus({preventScroll: true});

    // Restore scroll position
    if (scrollParent === window) {
      window.scrollTo(x, y);
    } else {
      Scroll.setTop(scrollParent, y);
    }

    // On Chrome and Safari, calling focus on contenteditable focuses the
    // cursor at the first character. This is something you don't expect when
    // you're clicking on an input element but not directly on a character.
    // Put the cursor back where it was before the blur.
    if (!alreadyHasFocus) {
      this.update(
        EditorState.forceSelection(editorState, editorState.getSelection()),
      );
    }
  };

  // eslint-disable-next-line fb-www/extra-arrow-initializer
  blur: () => void = (): void => {
    const editorNode = this.editor;
    if (!editorNode) {
      return;
    }
    invariant(isHTMLElement(editorNode), 'editorNode is not an HTMLElement');
    editorNode.blur();
  };

  /**
   * Used via `this.setMode(...)`.
   *
   * Set the behavior mode for the editor component. This switches the current
   * handler module to ensure that DOM events are managed appropriately for
   * the active mode.
   */
  // eslint-disable-next-line fb-www/extra-arrow-initializer
  setMode: DraftEditorModes => void = (mode: DraftEditorModes): void => {
    const {onPaste, onCut, onCopy} = this.props;
    const editHandler = {...handlerMap.edit};

    if (onPaste) {
      /* $FlowFixMe[incompatible-type] (>=0.117.0 site=www,mobile) This comment
       * suppresses an error found when Flow v0.117 was deployed. To see the
       * error delete this comment and run Flow. */
      editHandler.onPaste = onPaste;
    }

    if (onCut) {
      editHandler.onCut = onCut;
    }

    if (onCopy) {
      editHandler.onCopy = onCopy;
    }

    const handler = {
      ...handlerMap,
      edit: editHandler,
    };
    this._handler = handler[mode];
  };

  // eslint-disable-next-line fb-www/extra-arrow-initializer
  exitCurrentMode: () => void = (): void => {
    this.setMode('edit');
  };

  /**
   * Used via `this.restoreEditorDOM()`.
   *
   * Force a complete re-render of the DraftEditorContents based on the current
   * EditorState. This is useful when we know we are going to lose control of
   * the DOM state (cut command, IME) and we want to make sure that
   * reconciliation occurs on a version of the DOM that is synchronized with
   * our EditorState.
   */
  // eslint-disable-next-line fb-www/extra-arrow-initializer
  restoreEditorDOM: (scrollPosition?: DraftScrollPosition) => void = (
    scrollPosition?: DraftScrollPosition,
  ): void => {
    // Wrap state updates in `flushControlled`. In sync mode, this is
    // effectively a no-op. In async mode, this ensures all updates scheduled
    // inside are flushed before React yields to the browser.
    if (flushControlled) {
      flushControlled(() =>
        this.setState({contentsKey: this.state.contentsKey + 1}, () => {
          this.focus(scrollPosition);
        }),
      );
    } else {
      this.setState({contentsKey: this.state.contentsKey + 1}, () => {
        this.focus(scrollPosition);
      });
    }
  };

  /**
   * Used via `this.setClipboard(...)`.
   *
   * Set the clipboard state for a cut/copy event.
   */
  // eslint-disable-next-line fb-www/extra-arrow-initializer
  setClipboard: (?BlockMap) => void = (clipboard: ?BlockMap): void => {
    this._clipboard = clipboard;
  };

  /**
   * Used via `this.getClipboard()`.
   *
   * Retrieve the clipboard state for a cut/copy event.
   */
  // eslint-disable-next-line fb-www/extra-arrow-initializer
  getClipboard: () => ?BlockMap = (): ?BlockMap => {
    return this._clipboard;
  };

  /**
   * Used via `this.update(...)`.
   *
   * Propagate a new `EditorState` object to higher-level components. This is
   * the method by which event handlers inform the `DraftEditor` component of
   * state changes. A component that composes a `DraftEditor` **must** provide
   * an `onChange` prop to receive state updates passed along from this
   * function.
   */
  // eslint-disable-next-line fb-www/extra-arrow-initializer
  update: EditorState => void = (editorState: EditorState): void => {
    const onChange = this.props.onChange;
    this._latestEditorState = editorState;
    // Wrap state updates in `flushControlled`. In sync mode, this is
    // effectively a no-op. In async mode, this ensures all updates scheduled
    // inside are flushed before React yields to the browser.
    if (flushControlled) {
      flushControlled(() => onChange(editorState));
    } else {
      onChange(editorState);
    }
  };

  /**
   * Used in conjunction with `onDragLeave()`, by counting the number of times
   * a dragged element enters and leaves the editor (or any of its children),
   * to determine when the dragged element absolutely leaves the editor.
   */
  onDragEnter: () => void = (): void => {
    this._dragCount++;
  };

  /**
   * See `onDragEnter()`.
   */
  onDragLeave: () => void = (): void => {
    this._dragCount--;
    if (this._dragCount === 0) {
      this.exitCurrentMode();
    }
  };
}

module.exports = DraftEditor;
