import {
	AtomicBlockUtils,
	EditorState,
} from 'draft-js'

import { tableShape } from '../ModalTable'

function createTable(editorState) {
	const contentState = editorState.getCurrentContent()
	const { row, column, caption } = tableShape[tableShape.length - 1]
	/**
	 * cell = {
	 *     0: ["cell-0,0", "cell-0,1", ..., "cell-0,m"],
	 *     1: ["cell-1,0", "cell-1,1", ..., "cell-1,m"],
	 *     ...,
	 *     n: ["cell-n,0", "cell-n,1", ..., "cell-n,m"],
	 * }
	 */
	const cell = Object.fromEntries(Array.from(
		{ length: row },
		// eslint-disable-next-line no-shadow
		(_, i) => [i, Array.from({ length: column }, (_, j) => `cell-${i},${j}`)],
	))

	const contentStateWithEntity = contentState.createEntity(
		'TABLE',
		'IMMUTABLE',
		{
			row, column, caption, cell,
		},
	)
	const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
	const newEditorState = EditorState.set(
		editorState,
		{ currentContent: contentStateWithEntity },
	)
	return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
}

export default createTable
