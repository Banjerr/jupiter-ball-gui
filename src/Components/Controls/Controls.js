import React, { Component } from 'react';
import Ball from '../Ball/Ball.js';
import './Controls.css';
import FontAwesome from 'react-fontawesome';
import { SketchPicker } from 'react-color';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const SliderTooltip = createSliderWithTooltip(Slider);

const round = (value) => Number(Math.round(value+'e2')+'e-2');

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

class Controls extends Component {
  // constructor(props) {
  //   super(props);
    
  //   this.state = {   
  //     currentPole: 'NorthPole',   
  //     NorthPole: {
  //       duration: 0,
  //       fadeSpeed: 100,
  //       colorNumber: 1,
  //       colorList: ['color1'],
  //       color1: {
  //         color: '#ffffff',
  //         duration: 0,
  //         id: 'color1',
  //         fadeToNextColor: true
  //       }
  //     },
  //     SouthPole: {
  //       duration: 0,
  //       fadeSpeed: 100,
  //       colorNumber: 1,
  //       colorList: ['color1'],
  //       color1: {
  //         color: '#ffffff',
  //         duration: 0,
  //         id: 'color1',
  //         fadeToNextColor: true
  //       }
  //     }
  //   }

  //   this.onDragEnd = this.onDragEnd.bind(this);
  // }

  render() {
    return (
      <div 
        className="Controls">
        <section>
          <h3>{this.props.sequence.displayName}</h3>
          <p>Number of colors: {this.props.sequence.colorNumber}</p>
          <p>Length of sequence (in seconds): {round(this.props.sequence.duration)}</p>
          <label>Overall fade speed: {this.props.sequence.fadeSpeed}% (default is 100%)</label>
          <SliderTooltip 
            max={200}
            min={1}
            value={this.props.sequence.fadeSpeed}
            onChange={this.props.handleFadeSpeedChange}
          />

          <label htmlFor="add-color">Add color
            <button
              onClick={this.props.addColor} 
            >
              <FontAwesome                 
                name='plus' 
              />
            </button>
          </label> 
          
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
                          >                            
                            <header>
                              <h3>Color #{index + 1}</h3>
                              <label 
                                htmlFor="remove-color">Remove color
                                <button
                                  onClick={() => this.props.removeColor(item, index)} 
                                >
                                  <FontAwesome                         
                                    name='minus' 
                                  />
                                </button>
                              </label>
                              <label 
                                htmlFor="fade-to-next">Fade Into Next Color?
                                <input 
                                  type='checkbox' id="fade-to-next" value={this.props.sequence[item].fadeToNextColor}   
                                  defaultChecked={true} 
                                  onClick={() => this.props.handleFadeToNextChange(item)} />
                              </label>                                
                            </header>
                            
                            <SketchPicker
                              disableAlpha={true}
                              contenteditable={true}
                              color={this.props.sequence[item].color}
                              onChangeComplete={ this.props.handleColorChange(item) }
                            />

                            <h3>Time in milliseconds: {this.props.sequence[item].duration}</h3>
                            <SliderTooltip 
                              max={1000}
                              min={1}
                              onAfterChange={this.props.handleTimeChange(item)}
                            />
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
        {/* TODO FIX BALL, SEND OVER WHICH SIDE(S) THE CURRENT SEQUENCE BELONGS TO AND DO JUNK */}
        <Ball 
          northColors={this.props.sequence.northPole ? this.props.sequence.colorList.map((color) => color = this.props.sequence[color]) : null}
          northDuration={this.props.sequence.northPole ? this.props.sequence.duration : null}
          northFade={this.props.sequence.northPole ? this.props.sequence.fadeSpeed : null}
          southColors={this.props.sequence.southPole ? this.props.sequence.colorList.map((color) => color = this.props.sequence[color]) : null}
          southDuration={this.props.sequence.southPole ? this.props.sequence.duration : null}
          southFade={this.props.sequence.southPole ? this.props.sequence.fadeSpeed : null}
        />
      </div>
    );
  }
}

export default Controls;
