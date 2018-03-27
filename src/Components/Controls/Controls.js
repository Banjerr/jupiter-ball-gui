import React, { Component } from 'react';
import Ball from '../Ball/Ball.js';
import './Controls.css';
import FontAwesome from 'react-fontawesome';
import { SketchPicker } from 'react-color';
import { Button, Icon, Checkbox, Accordion, Form, Input, Segment, Popup } from 'semantic-ui-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const SliderTooltip = createSliderWithTooltip(Slider);

const round = (value) => Number(Math.round(value+'e2')+'e-2');

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

class Controls extends Component {
  render() {  
    return (
      <div 
        className="Controls">        
        <section>          
          <p>Length of sequence (in seconds): {round(this.props.sequence.duration)}</p>  
          <p>Number of colors: {this.props.sequence.colorNumber} - Click a color square to edit it!</p>                  

          <Button onClick={this.props.addColor} animated>
            <Button.Content visible>Add Color</Button.Content>
            <Button.Content hidden>
              <Icon name='plus' />
            </Button.Content>
          </Button><br /><br />
          
          <DragDropContext onDragEnd={this.props.onDragEnd}>
            <Droppable droppableId={this.props.sequence.id} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.props.sequence.colorList.map((item, index) => (
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
                              this.props.sequence[item].color
                            )}
                            onClick={() => this.props.editThisColor(item, index)}
                          >                            
                            <FontAwesome name="pencil" />
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>

        <div className="row">
          {this.props.colorEditMode ? 
            <section className="half-width">
              <header>
                <h3>Color #{this.props.editingThisColor.index + 1}</h3>
                
                <Button onClick={() => this.props.removeColor(this.props.editingThisColor.id, this.props.editingThisColor.index)}  animated>
                  <Button.Content visible>Remove Color</Button.Content>
                  <Button.Content hidden>
                    <Icon name='minus' />
                  </Button.Content>
                </Button>
                
                <Checkbox label="Fade Into Next Color" 
                  type='checkbox' id="fade-to-next"   
                  checked={this.props.sequence[this.props.editingThisColor.id].fadeToNextColor ? true : false}
                  onChange={() => this.props.handleFadeToNextChange(this.props.editingThisColor.id)} 
                />
              </header><br />
              
              <SketchPicker
                disableAlpha={true}
                contenteditable={true}
                color={this.props.sequence[this.props.editingThisColor.id].color}
                onChangeComplete={ this.props.handleColorChange(this.props.editingThisColor.id) }
              />

              <h3>Time in milliseconds: {this.props.sequence[this.props.editingThisColor.id].duration}ms</h3>
              <SliderTooltip 
                max={9999}
                min={1}
                value={this.props.sequence[this.props.editingThisColor.id].duration}
                onChange={this.props.handleTimeChange(this.props.editingThisColor.id)}
              />
            </section> :
            <section className="half-width">
              <p>Click a color above to edit</p>
            </section>
          }

          <div className="half-width">
            <Ball 
              northColors={this.props.sequence.northPole ? this.props.sequence.colorList.map((color) => color = this.props.sequence[color]) : null}
              northDuration={this.props.sequence.northPole ? this.props.sequence.duration : null}
              northFade={this.props.sequence.northPole ? this.props.sequence.fadeSpeed : null}
              southColors={this.props.sequence.southPole ? this.props.sequence.colorList.map((color) => color = this.props.sequence[color]) : null}
              southDuration={this.props.sequence.southPole ? this.props.sequence.duration : null}
              southFade={this.props.sequence.southPole ? this.props.sequence.fadeSpeed : null}
            />
          </div>
        </div>    
        
        <Segment>
          <Accordion>
            <Accordion.Title active={this.props.activeIndex === 2} index={2} onClick={() => this.props.handleSettingsAccordionClick(2)}>
              <Icon name='dropdown' />
              Settings
            </Accordion.Title>
            <Accordion.Content active={this.props.activeIndex === 2}>
              <Form.Field>
                <label>Sequence Name</label><br /><br />
                <Input maxLength='20' key='sequence-name-input' autoFocus type="text" id="name-input" onChange={(e) => this.props.updateName(e)} value={this.props.sequence.displayName} placeholder="Sequence Name Here" 
                  onFocus={function(e) {
                    var val = e.target.value;
                    e.target.value = '';
                    e.target.value = val;
                  }} 
                />
              </Form.Field><br /><br />
                <Popup
                  trigger={<label>Sequence play speed: {this.props.sequence.fadeSpeed}% (default is 100%)</label>}
                  content='Use this a quick way to affect the entire sequence timing. If 100%, the sequence will play as is, 50% - playing in double speed, 200% - playing in half speed, etc.'
                  style={{
                    borderRadius: 0,
                    opacity: 0.7,
                    padding: '2em',
                  }}
                  inverted
                /><br /><br />
                <SliderTooltip 
                  max={200}
                  min={1}
                  value={this.props.sequence.fadeSpeed}
                  onChange={this.props.handleFadeSpeedChange}
              /><br />
            </Accordion.Content>                    
          </Accordion>  
        </Segment>           
      </div>
    );
  }
}

export default Controls;
