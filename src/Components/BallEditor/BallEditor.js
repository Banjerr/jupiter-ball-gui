import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import { Button, Modal, Form, Checkbox, Input } from 'semantic-ui-react'
import Controls from '../Controls/Controls.js';
import './BallEditor.css';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  width: '100%',

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
    this.onSequenceDragEnd = this.onSequenceDragEnd.bind(this);
    this.updateName = this.updateName.bind(this);
    this.openNameModal = this.openNameModal.bind(this);
  }

  /* Sequence Methods */

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
        southPole: returnObj.currentNameAddSouth ? true :false,
        id: objectSafeSequenceName,
        duration: 0,
        fadeSpeed: 100,
        colorNumber: 1,
        colorList: ['color1'],
        color1: {
          color: '#ffffff',
          duration: 0,
          id: 'color1',
          fadeToNextColor: true
        }
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
        returnObj.sequenceData[sequence.id].northPole = false;

        if (!this.state.sequenceData[sequence.id].southPole) {
          returnObj.sequenceData[sequence.id] = undefined;
        }
      }
      else if (ballPart === 'southSequences') {
        returnObj.sequenceData[sequence.id].southPole = false;

        if (!this.state.sequenceData[sequence.id].northPole) {
          returnObj.sequenceData[sequence.id] = undefined;
        }
      }
      
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  onSequenceDragEnd(result) {
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

  editSequence = (sequence) => this.setState({currentSequence: sequence});

  handlePoleCheck = (addToNorth) => addToNorth ? 
    this.setState({currentNameAddNorth: !this.state.currentNameAddNorth}) :
    this.setState({currentNameAddSouth: !this.state.currentNameAddSouth});

  /* Sequence Editor Methods */

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.sequenceData[this.state.currentSequence.id].colorList,
      result.source.index,
      result.destination.index
    );

    let stateObject = function() {
      let returnObj = this.state;
      returnObj.sequenceData[this.state.currentSequence.id].colorList = items;
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  addColor = () => {
    let currentColorNumber = this.state.sequenceData[this.state.currentSequence.id].colorNumber,
      newPropName = 'color' + (currentColorNumber + 1) + Date.now();
      
    let stateObject = function() {
      let returnObj = this.state;
      returnObj.sequenceData[this.state.currentSequence.id]['colorNumber'] = currentColorNumber + 1;
      returnObj.sequenceData[this.state.currentSequence.id]['colorList'].push(newPropName);
      returnObj.sequenceData[this.state.currentSequence.id][newPropName] = {
        color: '#ffffff',
        duration: 0,
        id: newPropName,
        fadeToNextColor: true
      };
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  removeColor = (color, index) => {
    let currentColorNumber = this.state.sequenceData[this.state.currentSequence.id].colorNumber,
      currentColorList = this.state.sequenceData[this.state.currentSequence.id].colorList;

    currentColorList.splice(index, 1);

    let stateObject = function() {
      let returnObj = this.state;
      returnObj.sequenceData[this.state.currentSequence.id]['colorNumber'] = currentColorNumber > 0 ? 
        currentColorNumber - 1 : 0;
      returnObj.sequenceData[this.state.currentSequence.id]['colorList'] = currentColorList;
      returnObj.sequenceData[this.state.currentSequence.id]['duration'] = returnObj.sequenceData[this.state.currentSequence.id]['duration'] - (returnObj.sequenceData[this.state.currentSequence.id][color].duration / 1000);

      returnObj.sequenceData[this.state.currentSequence.id][color] = undefined;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleColorChange = (name) => (color) => {
    let stateObject = function() {
      let returnObj = this.state;
      returnObj.sequenceData[this.state.currentSequence.id].color = color.hex;
      returnObj.sequenceData[this.state.currentSequence.id][name].color = color.hex;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleTimeChange = (name) => (value) => {
    if (this.state.sequenceData[this.state.currentSequence.id][name].duration === value) return;

    let stateObject = function() {
      let returnObj = this.state;

      returnObj.sequenceData[this.state.currentSequence.id]['duration'] = returnObj.sequenceData[this.state.currentSequence.id][name].duration > value ?
        returnObj.sequenceData[this.state.currentSequence.id]['duration'] - ((returnObj.sequenceData[this.state.currentSequence.id][name].duration - value) / 1000) :
        returnObj.sequenceData[this.state.currentSequence.id]['duration'] + ((value - returnObj.sequenceData[this.state.currentSequence.id][name].duration) / 1000);

      returnObj.sequenceData[this.state.currentSequence.id][name].duration = value;
      return returnObj;
    }; 

    this.setState(stateObject);
  }

  handleFadeSpeedChange = (value) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj.sequenceData[this.state.currentSequence.id].fadeSpeed = value;

      return returnObj;
    }; 

    this.setState(stateObject);
  }

  handleFadeToNextChange = (item) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj.sequenceData[this.state.currentSequence.id][item].fadeToNextColor = returnObj.sequenceData[this.state.currentSequence.id][item].fadeToNextColor ? false : true;

      return returnObj;
    }; 

    this.setState(stateObject);
  }

  exitSequenceEditor = () => this.setState({currentSequence: null});

  copyToOppositePole = (ballPart) => {
    if (!this.state[ballPart].sequences) return;

    let copyThese = this.state[ballPart].sequences.slice(0),
      copyTo = ballPart === 'northSequences' ? 'southSequences' : 'northSequences';

    if (copyThese === this.state[copyTo].sequences) return;

    let stateObject = function() {
      let returnObj = this.state;

      returnObj[copyTo].sequences = copyThese;
      
      returnObj[ballPart].sequences.map((sequence) => {
        returnObj.sequenceData[sequence.id].northPole = true;
        returnObj.sequenceData[sequence.id].southPole = true;
      });

      return returnObj;
    }; 

    this.setState(stateObject);
  }

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
      <div className="container">
        {this.state.currentSequence ?
          <div>
            <button onClick={this.exitSequenceEditor}>              
              <FontAwesome name="arrow-left" />
              Back 
            </button>
            <Controls 
            handleFadeSpeedChange={this.handleFadeSpeedChange}
            addColor={this.addColor}
            onDragEnd={this.onDragEnd}
            removeColor={this.removeColor}
            handleFadeToNextChange={this.handleFadeToNextChange}
            handleColorChange={this.handleColorChange}
            handleTimeChange={this.handleTimeChange}
            sequence={this.state.sequenceData[this.state.currentSequence.id]}
            />
          </div> :
          <div className="sequenceContainer">
            <button 
              onClick={this.openNameModal}
            >
              <FontAwesome name='plus' />
            </button>
            <NameModal />          
            {ballParts.map((ballPart, index) => (
              <div className="columns" key={index}>
                <header>
                  {ballPart === 'northSequences' ?
                    <h2>North Pole</h2> :
                    <h2>South Pole</h2>
                  }
                  <button
                    onClick={() => this.copyToOppositePole(ballPart)}
                  >
                    Copy To {ballPart === 'northSequences' ? 'South' : 'North'}
                    <FontAwesome name="copy" />
                  </button>
                </header>
                <DragDropContext onDragEnd={this.onSequenceDragEnd}>
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
                                        htmlFor="remove-sequence">Remove sequence
                                        <button
                                          onClick={() => this.removeSequence(sequence, index, ballPart)} 
                                        >
                                          <FontAwesome                         
                                            name='minus' 
                                          />
                                        </button>
                                      </label>
                                      <label 
                                        htmlFor="edit-sequence">Edit sequence
                                        <button
                                          onClick={() => this.editSequence(sequence)} 
                                        >
                                          <FontAwesome                         
                                            name='pencil' 
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
              </div>
            ))}                     
          </div>
        }
      </div>      
    )
  }
}

export default BallEditor;