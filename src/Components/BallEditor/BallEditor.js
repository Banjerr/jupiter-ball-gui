import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Modal, Form, Input, Icon, Confirm, Accordion, Segment, Popup} from 'semantic-ui-react';
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
      sequenceData: {},
      colorEditMode: false,
      editingThisColor: null,
      addingSequenceTo: null,
      confirmationOpen: false,
      addingBallPartTo: null,
      editingThisPole: null,
      userNameModalOpen: true,        
      switch_time: 300,
      program_looping: true,
      start_first: false,
      fileGenerationModalOpen: false,
      xmlFile: null,
      copiedFile: false,
      userName: 'Super Creator1',
      activeIndex: 0
    }

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onSequenceDragEnd = this.onSequenceDragEnd.bind(this);
    this.updateName = this.updateName.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleFadeToNextChange = this.handleFadeToNextChange.bind(this);
    this.handleFadeSpeedChange = this.handleFadeSpeedChange.bind(this);
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.handleSettingsCheck = this.handleSettingsCheck.bind(this);
    this.handleSettingsAccordionClick = this.handleSettingsAccordionClick.bind(this);
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

    let xmlFile = `<?xml version="1.0" encoding="UTF-8"?>\r\n<SPEEVERS_LIGHT_DATA>\r\n<STAMP user="${xmlObj.user.padEnd(20, '~')}" date="${xmlObj.todays_date}" time="${xmlObj.todays_time}"></STAMP>\r\n<SETTINGS switch_time="${xmlObj.switch_time}" program_looping="${xmlObj.program_looping ? 1 : 0}" programs_north="${padNumber(xmlObj.northSequences.sequences.length, 2)}" programs_south="${padNumber(xmlObj.southSequences.sequences.length, 2)}" start_fst="${xmlObj.start_first ? 1 : 0}" place_holder="################################################################################################################################################################################################################################################################################################################################################################################################################"></SETTINGS>\r\n<PROGRAMS_NORTH>\r\n`;
xmlObj.northSequences.sequences.map((seq, index) => {
  let elementLength = 0;
  xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
    if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
      elementLength++;
    }

    return elementLength++;
  });
  xmlFile += `<PROGRAM serialN="${padNumber((index + 1), 2)}" name="${seq.displayName.padEnd(20, '~')}" elements="${padNumber(elementLength, 4)}" speed="${padNumber(xmlObj.sequenceData[seq.id].fadeSpeed, 3)}%">\r\n<PROG_DATA>\r\n`;
    xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
      xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@${padNumber(xmlObj.sequenceData[seq.id][color].duration, 4)};\r\n`;

      if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
        xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@0000;\r\n`;
      }

      return xmlFile;
    });
    xmlFile += `</PROG_DATA>\r\n</PROGRAM>\r\n`;

    return xmlFile;
});
xmlFile += `</PROGRAMS_NORTH>\r\n<PROGRAMS_SOUTH>\r\n`;
xmlObj.southSequences.sequences.map((seq, index) => {
  let elementLength = 0;
  xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
    if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
      elementLength++;
    }

    return elementLength++;
  });
  xmlFile += `<PROGRAM serialS="${padNumber((index + 1), 2)}" name="${seq.displayName.padEnd(20, '~')}" elements="${padNumber(elementLength, 4)}" speed="${padNumber(xmlObj.sequenceData[seq.id].fadeSpeed, 3)}%">\r\n<PROG_DATA>\r\n`;
  xmlObj.sequenceData[seq.id].colorList.map((color, index) => {
    xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@${padNumber(xmlObj.sequenceData[seq.id][color].duration, 4)};\r\n`;

    if (!xmlObj.sequenceData[seq.id][color].fadeToNextColor) {
      xmlFile += `${xmlObj.sequenceData[seq.id][color].color.replace('#', '')}@0000;\r\n`;
    }

    return xmlFile;
  });
  xmlFile += `</PROG_DATA>\r\n</PROGRAM>\r\n`;

  return xmlFile;
});
xmlFile += `</PROGRAMS_SOUTH>\r\n</SPEEVERS_LIGHT_DATA>`;
    
    return createDownload(xmlFile, 'speevers.xml', 'text/xml');
    // return this.setState({fileGenerationModalOpen: true, xmlFile: xmlFile});
  }

  /* Settings Methods */

  handleSettingsAccordionClick = (index) => {
    let activeIndex = this.state.activeIndex;
    let newIndex = activeIndex === index ? index - 2 : index;
    this.setState({ activeIndex: newIndex });
  }

  handleSettingsChange = (event) => {
    event.persist();

    if (event.target.name ===! 'switch_time' && event.target.value.length === 1) return;

    const name = event.target.name,
      value = event.target.value;

    let stateObject = function() {
      let returnObj = this.state;

      returnObj[name] = value;

      return returnObj;
    };

    this.setState(stateObject);
  }

  handleSettingsCheck = (name) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj[name] = this.state[name] ? false : true;

      return returnObj;
    };

    this.setState(stateObject);
  }

  /* Sequence Methods */

  addSequence = (ballPart) => {
    let stateObject = function() {
      let returnObj = this.state;
      let currentNameValue = 'Color Joy' + (this.state[ballPart].sequences.length + 1);

      let objectSafeSequenceName = currentNameValue.replace(/\s+/g, '-').toLowerCase() + '-' + + Date.now();
      
      if (ballPart === 'northSequences') {
        returnObj.northSequences.sequences.push({id: objectSafeSequenceName, displayName: currentNameValue});
      }

      if (ballPart === 'southSequences') {
        returnObj.southSequences.sequences.push({id: objectSafeSequenceName, displayName: currentNameValue});
      }

      returnObj.sequenceData[objectSafeSequenceName] = {
        displayName: currentNameValue,
        northPole: ballPart === 'northSequences' ? true : false,
        southPole: ballPart === 'southSequences' ? true :false,
        id: objectSafeSequenceName,
        duration: .5,
        fadeSpeed: 100,
        colorNumber: 1,
        colorList: ['color1'],
        color1: {
          color: '#D0021B',
          duration: 500,
          id: 'color1',
          fadeToNextColor: false
        }
      };

      returnObj.currentSequence = returnObj.sequenceData[objectSafeSequenceName];
      returnObj.editingThisColor = returnObj.sequenceData[objectSafeSequenceName].color1;
      returnObj.editingThisColor.index = 0;
      returnObj.editingThisSequence = returnObj.sequenceData[objectSafeSequenceName];
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

  updateName = (event) => {
    this.setState({ currentNameValue: event.target.value});
    return this.renameSequence(event.target.value);    
  }

  renameSequence = (newName) => {
    let stateObject = function() {
      let returnObj = this.state;

      returnObj.northSequences.sequences.map((seq) => {
        if (seq.displayName === this.state.editingThisSequence.displayName) {
          return seq.displayName = newName;
        } else return null;
      });

      returnObj.southSequences.sequences.map((seq) => {
        if (seq.displayName === this.state.editingThisSequence.displayName) {
          return seq.displayName = newName;
        } else return null;
      });  

      returnObj.sequenceData[this.state.editingThisSequence.id].displayName = newName;
      returnObj.currentNameValue = '';
      // returnObj.editingThisSequence = '';
      returnObj.editingThisPole = null;

      return returnObj;
    }
  
    return this.setState( stateObject ); 
  }

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
        color: '#D0021B',
        duration: 500,
        id: newPropName,
        fadeToNextColor: false,
        index: currentColorNumber
      };
      returnObj.editingThisColor = returnObj.sequenceData[this.state.currentSequence.id][newPropName];
      returnObj.sequenceData[this.state.currentSequence.id]['duration'] = returnObj.sequenceData[this.state.currentSequence.id]['duration'] + .5;
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
        <section>
          <span className="appHeader">
            <h2 className="name">Jupiter – Smart LED ball – color sequences editor</h2>
            <h3 className="name">Hey {this.state.userName ? this.state.userName : ''}!</h3>
          </span>            
          <Confirm
            open={this.state.confirmationOpen}
            onCancel={this.handleCopyCancel}
            header='Copy All Sequences'
            onConfirm={this.handleCopyConfirm}
            content={this.state.addingBallPartTo === 'northSequences' ? 'Are you sure? This will replace the entire South Pole' : 'Are you sure? This will replace the entire North Pole'}
          />
          <FileCopyModal />     
          {this.state.currentSequence ?
            <div>
              <Button onClick={this.exitSequenceEditor} animated>
                <Button.Content visible>Save And Back</Button.Content>
                <Button.Content hidden>
                  <Icon name='left arrow' />
                </Button.Content>
              </Button><br /><br />
              <Controls 
                handleFadeSpeedChange={this.handleFadeSpeedChange}
                addColor={this.addColor}
                onDragEnd={this.onDragEnd}
                removeColor={this.removeColor}
                handleTimeChange={this.handleTimeChange}
                sequence={this.state.sequenceData[this.state.currentSequence.id]}
                editThisColor={this.editThisColor}
                colorEditMode={this.state.colorEditMode}
                editingThisColor={this.state.editingThisColor}
                activeIndex={this.state.activeIndex}
                handleSettingsAccordionClick={this.handleSettingsAccordionClick}
                updateName={this.updateName}
                handleFadeToNextChange={this.handleFadeToNextChange}
                handleColorChange={this.handleColorChange}
              />
            </div> :
            <div>                                       
              <div className="sequenceContainer">            
                {ballParts.map((ballPart, index) => (
                  <div className="columns" key={index}>
                    <header>
                      {ballPart === 'northSequences' ?
                        <h2>North Pole</h2> :
                        <h2>South Pole</h2>
                      }
                      <span>
                        <Button onClick={() => this.addSequence(ballPart)} animated>
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
                                        <header className='sequenceHeader'>
                                          <h3>{sequence.displayName}</h3>
                                          <Icon className='closeBtn' name='close' onClick={() => this.removeSequence(sequence, index, ballPart)} /><br />                           
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
                </Button></section> : 
                <section><br /><br />
                  <Popup
                    trigger={<Button animated>
                      <Button.Content visible>Generate File And Play!
                      </Button.Content>
                      <Button.Content hidden>
                        <Icon name='download' />
                      </Button.Content>
                    </Button>}
                    content='You need to have at least one sequence on each side to generate the file.'
                    style={{
                      borderRadius: 0,
                      opacity: 0.7,
                      padding: '2em',
                    }}
                    inverted
                  />
                </section>
              }
              <Segment>
                <Accordion>
                  <Accordion.Title active={this.state.activeIndex === 1} index={1} onClick={() => this.handleSettingsAccordionClick(1)}>
                    <Icon name='dropdown' />
                    Settings
                  </Accordion.Title>
                  <Accordion.Content active={this.state.activeIndex === 1}>
                    <SettingsModal 
                      parentState={this.state} 
                      handleSettingsChange={this.handleSettingsChange}
                      closeSettingsModal={this.closeSettingsModal}  
                      handleSettingsCheck={this.handleSettingsCheck} 
                    />
                  </Accordion.Content>                    
                </Accordion> 
              </Segment> 
            </div>             
          }
        </section>               
      </div>      
    )
  }
}

export default BallEditor;