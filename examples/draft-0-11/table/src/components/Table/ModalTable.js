import React, {useState} from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col,
  Row,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';

export const tableShape = [];

const ModalTable = props => {
  const {buttonLabel, className, onClick} = props;

  const [modal, setModal] = useState(false);
  const rowRef = React.useRef(null);
  const columnRef = React.useRef(null);
  const captionRef = React.useRef(null);

  const toggle = () => setModal(!modal);

  const handleClick = () => {
    const tableData = {
      row: rowRef.current.value,
      column: columnRef.current.value,
      caption: captionRef.current.value,
    };
    tableShape.push(tableData);
    onClick();
    toggle();
  };

  return (
    <>
      <button color="danger" onClick={toggle} type="button">
        {buttonLabel}
      </button>
      <Modal isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle}>Modal title</ModalHeader>
        <ModalBody>
          <Form>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="tableRow">Row</Label>
                  <Input
                    type="text"
                    name="row"
                    id="tableRow"
                    innerRef={rowRef}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="tableColumn">Column</Label>
                  <Input
                    type="text"
                    name="column"
                    id="tableColumn"
                    innerRef={columnRef}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row form>
              <Col>
                <FormGroup>
                  <Label for="tableTitle">Title</Label>
                  <Input
                    type="text"
                    name="title"
                    id="tableTitle"
                    innerRef={captionRef}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleClick}>
            Yes
          </Button>{' '}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ModalTable;
