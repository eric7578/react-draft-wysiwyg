import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AtomicBlockUtils } from 'draft-js';
import './styles.css';

const generateArray = (length: number, insert = '') => {
  const array = [];
  array.length = length;
  array.fill(insert);
  return array;
}

const generate2dArray = (x: number, y: number, insert = '') => {
  const array2d = [];
  for (let i = 0; i < y; i++) {
    array2d.push(generateArray(x, insert));
  }
  return array2d;
}

const CELL_WIDTH = 20;
const CELL_HEIGHT = 20;

const generateEmptyAttrs = (x, y) => {
  const attributes = [];
  for (let i = 0; i < y; i++) {
    attributes.push({
      attributes: {},
      style: {},
      td: {
        attributes: [],
        style: []
      }
    });
    for (let j = 0; j < x; j++) {
      attributes[i].td.attributes.push({});
      attributes[i].td.style.push({});
    }
  }
  return attributes;
}

export default class Table extends Component {
  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  _isPlanningTable = false;

  state = {
    isTableInsertOpen: false,
    numCellCol: 1,
    numCellRow: 1
  };

  toggleTableInsertControl = () => {
    const { isTableInsertOpen } = this.state;
    this.setState({ isTableInsertOpen: !isTableInsertOpen });
  }

  onAddTable = (xCells, yCells) => {
    const { editorState, onChange } = this.props;
    const grids = generate2dArray(xCells, yCells);
    const attributes = generateEmptyAttrs(xCells, yCells)
    const contentStateWithEntity = editorState
      .getCurrentContent()
      .createEntity(
        'TABLE',
        'MUTABLE',
        {
          grids,
          style: {},
          attributes,
        }
      );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    onChange(newEditorState);
    this.toggleTableInsertControl();
  }

  onMouseMoveHandler = event => {
    if (this._isPlanningTable) {
      const refCellsRect = this._refCells.getBoundingClientRect();
      const numCellCol = Math.max(Math.floor((event.clientX - refCellsRect.left) / CELL_WIDTH) + 1, 1);
      const numCellRow = Math.max(Math.floor((event.clientY - refCellsRect.top) / CELL_HEIGHT) + 1, 1);
      this.setState({numCellCol, numCellRow});
    }
  }

  onMouseEnterHandler = () => {
    this._isPlanningTable = true;
  }

  onMouseLeaveHandler = () => {
    this._isPlanningTable = false;
  }

  render() {
    const {isTableInsertOpen, numCellCol, numCellRow} = this.state;

    return (
      <div className='rdw-table-wrapper'>
        <i
          className='rdw-option-wrapper rdw-table-icon'
          onClick={this.toggleTableInsertControl}
        />
        {isTableInsertOpen &&
          <div
            className='rdw-table-modal rdw-table-cells'
            onMouseMove={this.onMouseMoveHandler}
            onMouseEnter={this.onMouseEnterHandler}
            onMouseLeave={this.onMouseLeaveHandler}
          >
            <div ref={c => this._refCells = c}>
              <div
                className='rdw-table-picker-container'
                onClick={e => this.onAddTable(numCellCol, numCellRow)}
              >
                <div
                  className='rdw-table-picker-cell'
                  style={{
                    width: numCellCol * CELL_WIDTH,
                    height: numCellRow * CELL_HEIGHT
                  }}
                />
              </div>
            </div>
            <div>{`${numCellCol} X ${numCellRow}`}</div>
          </div>
        }
      </div>
    );
  }
}
