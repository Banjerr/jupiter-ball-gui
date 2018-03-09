import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FontAwesome from 'react-fontawesome';
import { Button, Modal, Form, Checkbox, Input, Icon, Confirm } from 'semantic-ui-react';
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
  justifyContent: 'flex-start',
  alignItems: 'center',
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
      nameModalOpen: false,
      sequenceData: {},
      colorEditMode: false,
      editingThisColor: null,
      addingSequenceTo: null,
      confirmationOpen: false,
      addingBallPartTo: null,
      editingThisPole: null,
      userNameModalOpen: true
    }

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onSequenceDragEnd = this.onSequenceDragEnd.bind(this);
    this.updateName = this.updateName.bind(this);
    this.openNameModal = this.openNameModal.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleFadeToNextChange = this.handleFadeToNextChange.bind(this);
    this.handleFadeSpeedChange = this.handleFadeSpeedChange.bind(this);
  }

  /* Sequence Methods */

  addSequence = () => {
    let stateObject = function() {
      let returnObj = this.state;

      let objectSafeSequenceName = this.state.currentNameValue.replace(/\s+/g, '-').toLowerCase() + '-' + + Date.now();
      
      if (this.state.addingSequenceTo === 'northSequences') {
        returnObj.northSequences.sequences.push({id: objectSafeSequenceName, displayName: this.state.currentNameValue});
      }

      if (this.state.addingSequenceTo === 'southSequences') {
        returnObj.southSequences.sequences.push({id: objectSafeSequenceName, displayName: this.state.currentNameValue});
      }

      returnObj.sequenceData[objectSafeSequenceName] = {
        displayName: this.state.currentNameValue,
        northPole: this.state.addingSequenceTo === 'northSequences' ? true : false,
        southPole: this.state.addingSequenceTo === 'southSequences' ? true :false,
        id: objectSafeSequenceName,
        duration: 0,
        fadeSpeed: 100,
        colorNumber: 1,
        colorList: ['color1'],
        color1: {
          color: '#ffffff',
          duration: 1,
          id: 'color1',
          fadeToNextColor: true
        }
      };

      returnObj.nameModalOpen = false;
      returnObj.currentSequence = returnObj.sequenceData[objectSafeSequenceName];
      returnObj.editingThisColor = returnObj.sequenceData[objectSafeSequenceName].color1;
      returnObj.editingThisColor.index = 0;
      returnObj.colorEditMode = true;
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  copySequence = (sequence, index, ballPart) => {
    let copyTo = ballPart === 'northSequences' ? 'southSequences' : 'northSequences',
      alreadyThere = [];
    alreadyThere = this.state[copyTo].sequences.filter((seq) => {
      if (sequence.id === seq.id) return seq;
    });
    if (alreadyThere.length > 0) {
      return
    }
    else {
      let stateObject = function() {
        let returnObj = this.state;
        returnObj[copyTo].sequences.push(sequence);
        returnObj.sequenceData[sequence.id].northPole = true;
        returnObj.sequenceData[sequence.id].southPole = true;
        
        return returnObj;
      }
    
      this.setState( stateObject ); 
    }
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

  updateName = (event) => this.setState({ currentNameValue: event.target.value});

  openRenameModal = (sequence, ballPart) => this.setState({ editingThisSequence: sequence, renameModalOpen: true, editingThisPole: ballPart || null });

  closeRenameModal = () => this.setState({ editingThisSequence: '', currentNameValue: '', renameModalOpen: false, editingThisPole: null });

  renameSequence = () => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj.northSequences.sequences.map((seq) => {
        if (seq.displayName === this.state.editingThisSequence.displayName) {
          seq.displayName = this.state.currentNameValue;
        }
      });

      returnObj.southSequences.sequences.map((seq) => {
        if (seq.displayName === this.state.editingThisSequence.displayName) {
          seq.displayName = this.state.currentNameValue;
        }
      });  

      returnObj.sequenceData[this.state.editingThisSequence.id].displayName = this.state.currentNameValue;
      returnObj.currentNameValue = '';
      returnObj.editingThisSequence = '';
      returnObj.renameModalOpen = false;
      returnObj.editingThisPole = null;

      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  openNameModal = (ballPart) => this.setState({nameModalOpen: true, addingSequenceTo: ballPart});

  closeNameModal = () => this.setState({nameModalOpen: false, addingSequenceTo: null});

  editSequence = (sequence) => this.setState({currentSequence: sequence});

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
        duration: 1,
        id: newPropName,
        fadeToNextColor: true,
        index: currentColorNumber
      };
      returnObj.editingThisColor = returnObj.sequenceData[this.state.currentSequence.id][newPropName];
      returnObj.colorEditMode = true;
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
      returnObj.editingThisColor = {};
      returnObj.colorEditMode = false;

      return returnObj;
    };
    
    this.setState(stateObject);
  }
  
  handleColorChange = (name) => (color) => {
    let stateObject = function() {
      let returnObj = this.state;
      returnObj.sequenceData[this.state.currentSequence.id].color = color.hex;
      returnObj.sequenceData[this.state.currentSequence.id][name].color = color.hex;
      returnObj.editingThisColor.color = returnObj.sequenceData[this.state.currentSequence.id][name].color;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleTimeChange = (name) => (value) => {
    if (this.state.sequenceData[this.state.currentSequence.id][name].duration === value || value === 1) return;

    let component = this;

    let stateObject = function() {
      let returnObj = component.state;

      returnObj.sequenceData[component.state.currentSequence.id]['duration'] = returnObj.sequenceData[component.state.currentSequence.id][name].duration > value ?
        returnObj.sequenceData[component.state.currentSequence.id]['duration'] - ((returnObj.sequenceData[component.state.currentSequence.id][name].duration - value) / 1000) :
        returnObj.sequenceData[component.state.currentSequence.id]['duration'] + ((value - returnObj.sequenceData[component.state.currentSequence.id][name].duration) / 1000);

      returnObj.sequenceData[component.state.currentSequence.id][name].duration = value;

      returnObj.editingThisColor.duration = returnObj.sequenceData[component.state.currentSequence.id][name].duration;

      return returnObj;
    }; 

    component.setState(stateObject);  
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

      returnObj.editingThisColor = returnObj.sequenceData[this.state.currentSequence.id][item];

      return returnObj;
    }; 

    this.setState(stateObject);
  }

  exitSequenceEditor = () => this.setState({currentSequence: null, colorEditMode: false, currentNameValue: ''});

  showCopyConfirmation = (ballPart) => this.setState({confirmationOpen: true, addingBallPartTo: ballPart});

  handleCopyConfirm = () => this.setState({confirmationOpen: false}, this.copyToOppositePole());

  handleCopyCancel = () => this.setState({confirmationOpen: false, addingBallPartTo: null});

  copyToOppositePole = () => {
    let ballPart = this.state.addingBallPartTo;

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

  editThisColor = (item, index) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj.editingThisColor = returnObj.sequenceData[this.state.currentSequence.id][item];
      returnObj.editingThisColor.index = index;
      returnObj.colorEditMode = true;      

      return returnObj;
    }; 

    this.setState(stateObject);
  }

  closeUserNameModal = () => this.setState({userNameModalOpen: false});

  setUserName = (event) => this.setState({userName: event.target.value});

  saveName = () => this.setState({userNameModalOpen: false});

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
          </Form>          
        </Modal.Content>
        <Modal.Actions>
          <Button type='submit' positive icon='checkmark' labelPosition='right' content='Create Sequence' onClick={this.addSequence} />
        </Modal.Actions>
      </Modal>
    ); 
    // TODO FINISH SETTINGS, GENEREAL XML, TIDY UP
    const RenameModal = () => (
      <Modal open={this.state.renameModalOpen} onClose={this.closeRenameModal} size={'tiny'} >
        <Modal.Header>
          Rename {this.state.editingThisSequence ? this.state.editingThisSequence.displayName : 'sequences'}
        </Modal.Header>
        <Modal.Content>
          <p>Choose a new name for this sequence. <span role="img" aria-label="smiley">🙌</span></p>
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
          </Form>          
        </Modal.Content>
        <Modal.Actions>
          <Button type='submit' positive icon='checkmark' labelPosition='right' content='Rename Sequence' onClick={this.renameSequence} />
        </Modal.Actions>
      </Modal>
    )

    const UserNameModal = () => (
      <Modal open={this.state.userNameModalOpen} onClose={this.closeUserNameModal} size={'tiny'} >
        <Modal.Header>
          Hey! Who are you?
        </Modal.Header>
        <Modal.Content>
          <p>What should we call you? (limit is 20 characters) <span role="img" aria-label="smiley">😬</span></p>
          <Form key='name-form'>
            <Form.Field>
              <label>Your Name</label>
              <Input key='name-input' autoFocus type="text" id="name-input" onChange={(e) => this.setUserName(e)} value={this.state.userName} placeholder="Name Here" 
                onFocus={function(e) {
                  var val = e.target.value;
                  e.target.value = '';
                  e.target.value = val;
                }} 
              />
            </Form.Field>
          </Form>          
        </Modal.Content>
        <Modal.Actions>
          <Button type='submit' positive icon='checkmark' labelPosition='right' content='Get Started' onClick={this.saveName} />
        </Modal.Actions>
      </Modal>
    )

    return (
      <div className="container">
        <Confirm
          open={this.state.confirmationOpen}
          onCancel={this.handleCopyCancel}
          header='Copy All Sequences'
          onConfirm={this.handleCopyConfirm}
          content={this.state.addingBallPartTo === 'northSequences' ? 'Are you sure? This will replace the entire South Pole' : 'Are you sure? This will replace the entire North Pole'}
        />
        <RenameModal />
        <UserNameModal />
        {this.state.currentSequence ?
          <div>
            <Button onClick={this.exitSequenceEditor} animated>
              <Button.Content visible>Back</Button.Content>
              <Button.Content hidden>
                <Icon name='left arrow' />
              </Button.Content>
            </Button><br /><br />
            <Controls 
              handleFadeSpeedChange={this.handleFadeSpeedChange}
              addColor={this.addColor}
              onDragEnd={this.onDragEnd}
              removeColor={this.removeColor}
              handleFadeToNextChange={this.handleFadeToNextChange}
              handleColorChange={this.handleColorChange}
              handleTimeChange={this.handleTimeChange}
              sequence={this.state.sequenceData[this.state.currentSequence.id]}
              editThisColor={this.editThisColor}
              colorEditMode={this.state.colorEditMode}
              editingThisColor={this.state.editingThisColor}
              openRenameModal={this.openRenameModal}
            />
          </div> :
          <div>            
            <div className="sequenceContainer">            
              <NameModal />          
              {ballParts.map((ballPart, index) => (
                <div className="columns" key={index}>
                  <header>
                    {ballPart === 'northSequences' ?
                      <h2>North Pole</h2> :
                      <h2>South Pole</h2>
                    }
                    <span>
                      <Button onClick={() => this.openNameModal(ballPart)} animated>
                        <Button.Content visible>Add Sequence</Button.Content>
                        <Button.Content hidden>
                          <Icon name='plus' />
                        </Button.Content>
                      </Button>
                      <Button onClick={() => this.showCopyConfirmation(ballPart)} animated>
                        <Button.Content visible>Copy All To {ballPart === 'northSequences' ? 'South' : 'North'}</Button.Content>
                        <Button.Content hidden>
                          <Icon name='copy' />
                        </Button.Content>
                      </Button>                    
                    </span><br />                  
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
                                  <div className="full-width">
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
                                        <Button onClick={() => this.openRenameModal(sequence, ballPart)}  animated>
                                          <Button.Content visible><h3>{sequence.displayName}</h3></Button.Content>
                                          <Button.Content hidden>
                                            <Icon name='pencil' />
                                          </Button.Content>
                                        </Button><br />                           
                                        <span>
                                          <Button onClick={() => this.editSequence(sequence)}  animated>
                                            <Button.Content visible>Edit</Button.Content>
                                            <Button.Content hidden>
                                              <Icon name='pencil' />
                                            </Button.Content>
                                          </Button>
                                          <Button className='copySequenceBtn' onClick={() => this.copySequence(sequence, index, ballPart)}  animated>
                                            <Button.Content visible>Copy</Button.Content>
                                            <Button.Content hidden>
                                              <Icon name='copy' />
                                            </Button.Content>
                                          </Button>
                                          <Button onClick={() => this.removeSequence(sequence, index, ballPart)}  animated>
                                            <Button.Content visible>Delete</Button.Content>
                                            <Button.Content hidden>
                                              <Icon name='trash' />
                                            </Button.Content>
                                          </Button>                                          
                                        </span>      
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
          </div>          
        }
      </div>      
    )
  }
}

export default BallEditor;