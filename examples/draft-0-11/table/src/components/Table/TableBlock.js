import React from 'react';

const TableOutput = props => {
  const {row, column, caption, cell, block, blockProps} = props;
  const container = React.useRef(null);

  const rows = [];
  const theadRow = [];
  const theadCol = [];

  const [coordinate, setCoordinate] = React.useState([]);

  function handleClick(evt) {
    blockProps.onStartEdit(block.getKey());
    let table = evt.target.closest('table');

    let editingTd;
    let textArea = null;

    table.ondblclick = function(evt) {
      // 3 possible targets
      let target = evt.target.closest('td');

      if (!table.contains(target)) return;

      if (target.nodeName === 'TD') {
        if (editingTd) return;
        makeTdEditable(target);
      }
    };

    function makeTdEditable(td) {
      editingTd = {
        elem: td,
        data: td.innerHTML,
      };

      td.classList.add('edit-td'); // td is in edit state, CSS also styles the area inside

      textArea = document.createElement('textarea');
      textArea.style.width = td.clientWidth + 'px';
      textArea.style.height = td.clientHeight + 'px';
      textArea.className = 'edit-area';

      textArea.value = td.innerHTML;
      td.innerHTML = '';
      td.appendChild(textArea);
      textArea.focus();

      textArea.onblur = function() {
        editEnd(td);
      };
    }

    function editEnd(td) {
      const x = coordinate[0];
      const y = coordinate[1];
      cell[x][y] = textArea.value;
      td.innerHTML = textArea.value;
      textArea.replaceWith(td);
      editingTd = null;
      blockProps.onFinishEdit(block.getKey());
    }
  }

  /**
   * 1. thead
   *  @param theadCol
   *  @param theadRow
   */

  for (let i = 0; i < column; i += 1) {
    theadCol.push(<th key={i}>{cell[0][i]}</th>);
  }

  theadRow.push(
    // TODO key-1
    <thead key="thead">
      <tr>{theadCol}</tr>
    </thead>,
  );

  /**
   * 2. tbody
   *  @param row
   */

  if (row > 1) {
    for (let i = 1; i < row; i += 1) {
      const cols = []; // look out, it's local in for loop, not out like @rows
      for (let j = 0; j < column; j += 1) {
        cols.push(
          // eslint-disable-next-line max-len
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
          <td
            key={i + j} // TODO key-2
            onClick={() => setCoordinate([i, j])}>
            {cell[i][j]}
          </td>,
        );
      }
      rows.push(<tr key={i}>{cols}</tr>); // TODO key-3
    }
  }

  return (
    <table className="hover-table" onClick={handleClick} ref={container}>
      <caption>{caption}</caption>
      {theadRow}
      <tbody>{rows}</tbody>
    </table>
  );
};

const TableBlock = props => {
  const {contentState, block, blockProps} = props;

  const entity = contentState.getEntity(block.getEntityAt(0));
  const shape = entity.getData();

  return (
    <TableOutput
      row={shape.row}
      column={shape.column}
      caption={shape.caption}
      cell={shape.cell}
      block={block}
      blockProps={blockProps}
    />
  );
};

export default TableBlock;
