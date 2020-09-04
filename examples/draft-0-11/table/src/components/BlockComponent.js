import React from 'react';
import TableBlock from './Table/TableBlock';

const BlockComponent = props => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const type = entity.getType();

  if (type === 'TABLE') {
    return (
      <TableBlock
        blockProps={props.blockProps}
        block={props.block}
        contentState={props.contentState}
      />
    );
  }

  return null;
};

export default BlockComponent;
