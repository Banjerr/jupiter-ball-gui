import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import { Button, Modal, Form, Checkbox, Input } from 'semantic-ui-react'
import './BallEditor.css';

let addingSequenceTo;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle, itemColor) => ({
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : itemColor,

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});

class BallEditor extends Component {
  constructor(props) {
    super(props);
    
    this.state = {   
      northSequences: {
        sequences: []
      },
      southSequences: {
        sequences: []
      },
      currentSequence: null,
      currentNameValue: '',
      currentNameAddNorth: false,
      currentNameAddSouth: false,
      nameModalOpen: false,
      sequenceData: {}
    }

    this.onDragEnd = this.onDragEnd.bind(this);
    this.updateName = this.updateName.bind(this);
    this.openNameModal = this.openNameModal.bind(this);
    this.handleRef = this.handleRef.bind(this);
  }

  addSequence = () => {
    let stateObject = function() {
      let returnObj = this.state;

      let objectSafeSequenceName = this.state.currentNameValue.replace(/\s+/g, '-').toLowerCase() + '-' + + Date.now();
      
      if (returnObj.currentNameAddNorth) {
        if (!returnObj.northSequences.sequences) returnObj.northSequences.sequences = [];

        returnObj.northSequences.sequences.push({id: objectSafeSequenceName, displayName: this.state.currentNameValue});
      }

      if (returnObj.currentNameAddSouth) {
        if (!returnObj.southSequences.sequences) returnObj.southSequences.sequences = [];

        returnObj.southSequences.sequences.push({id: objectSafeSequenceName, displayName: this.state.currentNameValue});
      }

      returnObj.sequenceData[objectSafeSequenceName] = {
        displayName: this.state.currentNameValue,
        northPole: returnObj.currentNameAddNorth ? true : false,
        southPole: returnObj.currentNameAddSouth ? true :false
      };

      returnObj.nameModalOpen = false;
      returnObj.currentNameAddNorth = false;
      returnObj.currentNameAddSouth = false;
      
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  removeSequence = (sequence, index, ballPart) => {
    let currentSequenceList = this.state[ballPart].sequences;

    currentSequenceList.splice(index, 1);

    let stateObject = function() {
      let returnObj = this.state;

      returnObj[ballPart] = currentSequenceList;

      if (ballPart === 'northSequences') {
        if (!sequence.southPole) {
          returnObj[ballPart][sequence.name] = undefined;
        }
      }
      else if (ballPart === 'southSequences') {
        if (!sequence.northPole) {
          returnObj[ballPart][sequence.name] = undefined;
        }
      }
      
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  onDragEnd(result) {
    // dropped outside the list
    // if (!result.destination) {
    //   return;
    // }

    // const items = reorder(
    //   this.state[this.state.currentPole].colorList,
    //   result.source.index,
    //   result.destination.index
    // );

    // let stateObject = function() {
    //   let returnObj = this.state;
    //   returnObj[this.state.currentPole].colorList = items;
    //   return returnObj;
    // }
  
    // this.setState( stateObject ); 
  }

  updateName = (event) => this.setState({ currentNameValue: event.target.value });

  handleRef = component => (this.ref = component);

  openNameModal = () => this.setState({nameModalOpen: true});

  closeNameModal = () => this.setState({nameModalOpen: false});

  handlePoleCheck = (addToNorth) => addToNorth ? 
    this.setState({currentNameAddNorth: !this.state.currentNameAddNorth}) :
    this.setState({currentNameAddSouth: !this.state.currentNameAddSouth});

  render() {
    const ballParts = ['northSequences', 'southSequences'];

    const NameModal = () => (
      <Modal open={this.state.nameModalOpen} onClose={this.closeNameModal} size={'tiny'} >
        <Modal.Header>
          Sequence Name
        </Modal.Header>
        <Modal.Content>
          <p>What would you like to call this sequence? Don't worry, you can change this at anytime. <span role="img" aria-label="smiley">😀</span></p>
          <Form key='sequence-name-form'>
            <Form.Field>
              <label>Sequence Name</label>
              <Input key='sequence-name-input' autoFocus type="text" id="name-input" onChange={(e) => this.updateName(e)} value={this.state.currentNameValue} placeholder="Sequence Name Here" 
                onFocus={function(e) {
                  var val = e.target.value;
                  e.target.value = '';
                  e.target.value = val;
                }} 
              />
            </Form.Field>
            <Form.Field>
              <Checkbox checked={this.state.currentNameAddNorth ? true : false} onChange={() => this.handlePoleCheck(true)} label='Add To North Pole' />
            </Form.Field>
            <Form.Field>
              <Checkbox checked={this.state.currentNameAddSouth ? true : false} onChange={() => this.handlePoleCheck(false)} label='Add To South Pole' />
            </Form.Field>
          </Form>          
        </Modal.Content>
        <Modal.Actions>
          <Button type='submit' positive icon='checkmark' labelPosition='right' content='Create Sequence' onClick={this.addSequence} />
        </Modal.Actions>
      </Modal>
    );    

    return (
      <div>
        <button 
          onClick={this.openNameModal}
        >
          <FontAwesome name='plus' />
        </button>
        <NameModal />  
        <DragDropContext onDragEnd={this.onDragEnd}>
          {ballParts.map((ballPart, index) => (
            <Droppable key={index} droppableId={ballPart} direction="vertical">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state[ballPart].sequences && this.state[ballPart].sequences.length ? 
                    this.state[ballPart].sequences.map((sequence, index) => (
                      <Draggable key={index} draggableId={index} index={index}>
                        {(provided, snapshot) => (
                          <div>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >                            
                              <header>
                                <h3>{sequence.displayName}</h3>
                                <label 
                                  htmlFor="remove-sequence">Remove color
                                  <button
                                    onClick={() => this.removeSequence(sequence, index, ballPart)} 
                                  >
                                    <FontAwesome                         
                                      name='minus' 
                                    />
                                  </button>
                                </label>                              
                              </header>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Draggable>
                    )) :
                    'Add A Sequence!'
                  }
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>              
      </div>
    )
  }
}

export default BallEditor;