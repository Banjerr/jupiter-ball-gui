import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Modal, Form, Input, Icon, Confirm } from 'semantic-ui-react';
import Controls from '../Controls/Controls.js';
import SettingsModal from './SettingsModal.js';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './BallEditor.css';
// TODO split up into separate components, improve, basically just needed to get it done quickly 🙌
const formatToday = () => {
  var today = new Date();
  var dd = today.getDate();

  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear().toString().substr(-2);

  if(dd<10) 
  {
      dd='0'+dd;
  } 

  if(mm<10) 
  {
      mm='0'+mm;
  }

  today = `${mm}/${dd}/${yyyy}`;

  return today;
}

const formatTime = () => {
  let time = new Date();

  let newTime = ("0" + time.getHours()).slice(-2)   + ":" + 
  ("0" + time.getMinutes()).slice(-2) + ":" + 
  ("0" + time.getSeconds()).slice(-2);

  return newTime;
}

const padNumber = (number, length) => {
  var str = '' + number;

  while (str.length < length) {
      str = '0' + str;
  }
 
  return str;
}

const createDownload = (data, filename, mime) => {
  var blob = new Blob([data], {type: mime || 'application/octet-stream'});

  if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // IE workaround for "HTML7007: One or more blob URLs were 
      // revoked by closing the blob for which they were created. 
      // These URLs will no longer resolve as the data backing 
      // the URL has been freed."
      window.navigator.msSaveBlob(blob, filename);
  }
  else {
      var blobURL = window.URL.createObjectURL(blob);
      var tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobURL;
      tempLink.setAttribute('download', filename); 
      
      // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking 
      // is enabled.
      if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
      }
      
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobURL);
  }
}

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
      userNameModalOpen: true,        
      switch_time: 300,
      settingsModalOpen: false,
      program_looping: true,
      start_first: false,
      fileGenerationModalOpen: false,
      xmlFile: null,
      copiedFile: false
    }

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onSequenceDragEnd = this.onSequenceDragEnd.bind(this);
    this.updateName = this.updateName.bind(this);
    this.openNameModal = this.openNameModal.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleFadeToNextChange = this.handleFadeToNextChange.bind(this);
    this.handleFadeSpeedChange = this.handleFadeSpeedChange.bind(this);
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.closeSettingsModal = this.closeSettingsModal.bind(this);
    this.handleSettingsCheck = this.handleSettingsCheck.bind(this);
  }

  createXMLFile = () => {
    let todays_date = formatToday();
    let todays_time = formatTime();

    let xmlObj = {
      user: this.state.userName || null,
      switch_time: this.state.switch_time || null,
      program_looping: this.state.program_looping || null,
      start_first: this.state.start_first || null,
      northSequences: this.state.northSequences || null,
      southSequences: this.state.southSequences || null,
      sequenceData: this.state.sequenceData || null,
      todays_date: todays_date,
      todays_time: todays_time
    };

    let xmlFile = `<?xml version="1.0" encoding="UTF-8"?>\n<SPEEVERS_LIGHT_DATA>\n<STAMP user="${xmlObj.user.padEnd(20, '~')}" date="${xmlObj.todays_date}" time="${xmlObj.todays_time}"></STAMP>\n<SETTINGS switch_time="${xmlObj.switch_time}" program_looping="${xmlObj.program_looping ? 1 : 0}" programs_north="${padNumber(xmlObj.northSequences.sequences.length, 2)}" programs_south="${padNumber(xmlObj.southSequences.sequences.length, 2)}" start_fst="${xmlObj.start_first ? 1 : 0}" place_holder="################################################################################################################################################################################################################################################################################################################################################################################################################"></SETTINGS>\n<PROGRAMS_NORTH>\n`;
xmlObj.northSequences.sequences.map((seq, index) => {
  let elementLength = 0;
  xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
    if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
      elementLength++;
    }

    elementLength++;
  });
  xmlFile += `<PROGRAM serialN="${padNumber((index + 1), 2)}" name="${seq.displayName.padEnd(20, '~')}" elements="${padNumber(elementLength, 4)}" speed="${padNumber(xmlObj.sequenceData[seq.id].fadeSpeed, 3)}%">\n<PROG_DATA>\n`;
    xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
      xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@${padNumber(xmlObj.sequenceData[seq.id][color].duration, 4)};\n`;

      if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
        xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@0000;\n`;
      }
    });
    xmlFile += `</PROG_DATA>\n</PROGRAM>\n`;
});
xmlFile += `</PROGRAMS_NORTH>\n<PROGRAMS_SOUTH>\n`;
xmlObj.southSequences.sequences.map((seq, index) => {
  let elementLength = 0;
  xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
    if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
      elementLength++;
    }

    elementLength++;
  });
  xmlFile += `<PROGRAM serialS="${padNumber((index + 1), 2)}" name="${seq.displayName.padEnd(20, '~')}" elements="${padNumber(elementLength, 4)}" speed="${padNumber(xmlObj.sequenceData[seq.id].fadeSpeed, 3)}%">\n<PROG_DATA>\n`;
  xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
    xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@${padNumber(xmlObj.sequenceData[seq.id][color].duration, 4)};\n`;

    if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
      xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@0000;\n`;
    }
  });
  xmlFile += `</PROG_DATA>\n</PROGRAM>\n`;
});
xmlFile += `</PROGRAMS_SOUTH>\n</SPEEVERS_LIGHT_DATA>`;
    
    return this.setState({fileGenerationModalOpen: true, xmlFile: xmlFile});
  }

  /* Settings Methods */

  handleSettingsChange = (event) => {
    event.persist();
    const name = event.target.name,
      value = event.target.value;

    let stateObject = function() {
      let returnObj = this.state;

      returnObj[name] = value;

      return returnObj;
    };

    this.setState(stateObject);
  }

  closeSettingsModal = () => this.setState({settingsModalOpen: false});

  openSettingsModal = () => this.setState({settingsModalOpen: true});

  handleSettingsCheck = (name) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj[name] = this.state[name] ? false : true;

      return returnObj;
    };

    this.setState(stateObject);
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

    alreadyThere = this.state[copyTo].sequences.filter((seq) => sequence.id === seq.id);

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
          return seq.displayName = this.state.currentNameValue;
        } else return null;
      });

      returnObj.southSequences.sequences.map((seq) => {
        if (seq.displayName === this.state.editingThisSequence.displayName) {
          return seq.displayName = this.state.currentNameValue;
        } else return null;
      });  

      returnObj.sequenceData[this.state.editingThisSequence.id].displayName = this.state.currentNameValue;
      returnObj.currentNameValue = '';
      returnObj.editingThisSequence = '';
      returnObj.renameModalOpen = false;
      returnObj.editingThisPole = null;

      return returnObj;
    }
  
    return this.setState( stateObject ); 
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
        return returnObj.sequenceData[sequence.id];
      });

      return returnObj;
    }; 

    return this.setState(stateObject);
  }

  editThisColor = (item, index) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj.editingThisColor = returnObj.sequenceData[this.state.currentSequence.id][item];
      returnObj.editingThisColor.index = index;
      returnObj.colorEditMode = true;      

      return returnObj;
    }; 

    return this.setState(stateObject);
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
          <p>What would you like to call this sequence? Don't worry, you can change this at anytime. <span role="img" aria-label="smiley">😀</span> (limit is 20 characters)</p>
          <Form key='sequence-name-form'>
            <Form.Field>
              <label>Sequence Name</label>
              <Input maxLength='20' key='sequence-name-input' autoFocus type="text" id="name-input" onChange={(e) => this.updateName(e)} value={this.state.currentNameValue} placeholder="Sequence Name Here" 
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

    const RenameModal = () => (
      <Modal open={this.state.renameModalOpen} onClose={this.closeRenameModal} size={'tiny'} >
        <Modal.Header>
          Rename {this.state.editingThisSequence ? this.state.editingThisSequence.displayName : 'sequences'}
        </Modal.Header>
        <Modal.Content>
          <p>Choose a new name for this sequence. <span role="img" aria-label="smiley">🙌</span> (limit is 20 characters)</p>
          <Form key='sequence-name-form'>
            <Form.Field>
              <label>Sequence Name</label>
              <Input maxLength='20' key='sequence-name-input' autoFocus type="text" id="name-input" onChange={(e) => this.updateName(e)} value={this.state.currentNameValue} placeholder="Sequence Name Here" 
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
              <Input maxLength='20' key='name-input' autoFocus type="text" id="name-input" onChange={(e) => this.setUserName(e)} value={this.state.userName} placeholder="Name Here" 
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

    const FileCopyModal = () => (
      <Modal open={this.state.fileGenerationModalOpen} onClose={() => this.setState({fileGenerationModalOpen: false})} size={'tiny'} >
        <Modal.Header>
          Your file is ready!
        </Modal.Header>
        <Modal.Content>
          <p>Congratulations! What next, you ask? Simply copy your new creation, plug in your Jupiter ball, open the <code>speevers.xml</code> file on the Jupiter, highlight all the contents of the file and paste in your new creation instead! <span role="img" aria-label="smiley">🙌</span></p>

          <CopyToClipboard text={this.state.xmlFile}
            onCopy={() => this.setState({copiedFile: true})}>
            <Button animated
              className="copyBtn">
              <Button.Content visible>Copy file to clipboard
              </Button.Content>
              <Button.Content hidden>
                <Icon name='copy' />
              </Button.Content>
            </Button>
          </CopyToClipboard>

          {this.state.copiedFile ? 
            <h4>File copied</h4> : ''}

          <div><code>{this.state.xmlFile}</code></div>          

        </Modal.Content>
      </Modal>
    )

    return (
      <div className="container">
        {this.state.settingsModalOpen ? 
          <SettingsModal 
            parentState={this.state} 
            handleSettingsChange={this.handleSettingsChange}
            closeSettingsModal={this.closeSettingsModal}  
            handleSettingsCheck={this.handleSettingsCheck} 
          /> :
          <section>
            <span className="appHeader">
              <Button animated
                className="settingsBtn"
                onClick={this.openSettingsModal}>
                <Button.Content visible>Settings
                </Button.Content>
                <Button.Content hidden>
                  <Icon name='cogs' />
                </Button.Content>
              </Button>
              <h3 className="text-uppercase name">Hey {this.state.userName ? this.state.userName : ''}!</h3>
            </span>            
            <Confirm
              open={this.state.confirmationOpen}
              onCancel={this.handleCopyCancel}
              header='Copy All Sequences'
              onConfirm={this.handleCopyConfirm}
              content={this.state.addingBallPartTo === 'northSequences' ? 'Are you sure? This will replace the entire South Pole' : 'Are you sure? This will replace the entire North Pole'}
            />
            <RenameModal />
            <UserNameModal />
            <FileCopyModal />     
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

                { this.state.northSequences.sequences.length && this.state.southSequences.sequences.length ?
                  <section><br /><br /><Button animated
                    onClick={this.createXMLFile}>
                    <Button.Content visible>Generate File And Play!
                    </Button.Content>
                    <Button.Content hidden>
                      <Icon name='download' />
                    </Button.Content>
                  </Button></section> : ''
                }
              </div>          
            }
          </section>          
        }        
      </div>      
    )
  }
}

export default BallEditor;