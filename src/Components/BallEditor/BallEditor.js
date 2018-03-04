import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import { Button, Modal, Form, Checkbox, Input } from 'semantic-ui-react'
import './BallEditor.css';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getContainerStyle = () => ({
  boxSizing: 'border-box',
  padding: `${grid * 2}px`,
  minHeight: '100vh',
  /* flexbox */
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start'
});

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-star',
  alignItems: 'flex-start',
  background: 'rgba(0, 0, 0, 0.1)',
  padding: `${grid}px`,
  maxHeight: '800px',
  overflow: 'auto'
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
  }

  addSequence = () => {
    let stateObject = function() {
      let returnObj = this.state;

      let objectSafeSequenceName = this.state.currentNameValue.replace(/\s+/g, '-').toLowerCase() + '-' + + Date.now();
      
      if (returnObj.currentNameAddNorth) {
        returnObj.northSequences.sequences.push({id: objectSafeSequenceName, displayName: this.state.currentNameValue});
      }

      if (returnObj.currentNameAddSouth) {
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

      returnObj[ballPart].sequences = currentSequenceList;

      if (ballPart === 'northSequences') {
        if (!this.state.sequenceData[sequence.id].southPole) {
          returnObj.sequenceData[sequence.id] = undefined;
        }
      }
      else if (ballPart === 'southSequences') {
        if (!this.state.sequenceData[sequence.id].northPole) {
          returnObj.sequenceData[sequence.id] = undefined;
        }
      }
      
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state[result.source.droppableId].sequences,
      result.source.index,
      result.destination.index
    );

    let stateObject = function() {
      let returnObj = this.state;
      returnObj[result.source.droppableId].sequences = items;
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  updateName = (event) => this.setState({ currentNameValue: event.target.value });

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
        {ballParts.map((ballPart, index) => (
          <DragDropContext key={index} onDragEnd={this.onDragEnd}>
            <Droppable droppableId={ballPart} direction="vertical">
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
                                provided.draggableProps.style,
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
          </DragDropContext> 
        ))}                     
      </div>
    )
  }
}

export default BallEditor;