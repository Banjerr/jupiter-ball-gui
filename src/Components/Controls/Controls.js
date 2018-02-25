import React, { Component } from 'react';
import Ball from '../Ball/Ball.js';
import './Controls.css';
import FontAwesome from 'react-fontawesome';
import { CirclePicker } from 'react-color';
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
  constructor(props) {
    super(props);
    
    this.state = {   
      currentPole: 'NorthPole',   
      NorthPole: {
        duration: 0,
        colorNumber: 1,
        colorList: ['color1'],
        color1: {
          color: '#ffffff',
          duration: 0,
          id: 'color1'
        }
      },
      SouthPole: {
        duration: 0,
        colorNumber: 1,
        colorList: ['color1'],
        color1: {
          color: '#ffffff',
          duration: 0,
          id: 'color1'
        }
      }
    }

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state[this.state.currentPole].colorList,
      result.source.index,
      result.destination.index
    );

    let stateObject = function() {
      let returnObj = this.state;
      returnObj[this.state.currentPole].colorList = items;
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  addColor = () => {
    let currentColorNumber = this.state[this.state.currentPole].colorNumber,
      newPropName = 'color' + (currentColorNumber + 1) + Date.now();

    let stateObject = function() {
      let returnObj = this.state;
      returnObj[this.state.currentPole]['colorNumber'] = currentColorNumber + 1;
      returnObj[this.state.currentPole]['colorList'].push(newPropName);
      returnObj[this.state.currentPole][newPropName] = {
        color: '#ffffff',
        duration: 0,
        id: newPropName
      };
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  removeColor = (color, index) => {
    let currentColorNumber = this.state[this.state.currentPole].colorNumber,
      currentColorList = this.state[this.state.currentPole].colorList;

    currentColorList.splice(index, 1);

    let stateObject = function() {
      let returnObj = this.state;
      returnObj[this.state.currentPole]['colorNumber'] = currentColorNumber > 0 ? 
        currentColorNumber - 1 : 0;
      returnObj[this.state.currentPole]['colorList'] = currentColorList;
      returnObj[this.state.currentPole]['duration'] = returnObj[this.state.currentPole]['duration'] - (returnObj[this.state.currentPole][color].duration / 1000);

      returnObj[this.state.currentPole][color] = undefined;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleColorChange = (name) => (color) => {
    let stateObject = function() {
      let returnObj = this.state;
      returnObj[this.state.currentPole][name].color = color.hex;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleTimeChange = (name) => (value) => {
    if (this.state[this.state.currentPole][name].duration === value) return;

    let stateObject = function() {
      let returnObj = this.state;

      returnObj[this.state.currentPole]['duration'] = returnObj[this.state.currentPole][name].duration > value ?
        returnObj[this.state.currentPole]['duration'] - ((returnObj[this.state.currentPole][name].duration - value) / 1000) :
        returnObj[this.state.currentPole]['duration'] + ((value - returnObj[this.state.currentPole][name].duration) / 1000);

      returnObj[this.state.currentPole][name].duration = value;
      return returnObj;
    }; 

    this.setState(stateObject);
  }

  render() {
    return (
      <div 
        className="Controls">
        <section>
          <h3>{this.state.currentPole}</h3>
          <p>Number of colors: {this.state[this.state.currentPole].colorNumber}</p>
          <p>Length of sequence (in seconds): {round(this.state[this.state.currentPole].duration)}</p>

          <label htmlFor="add-color">Add color
            <button
              onClick={this.addColor} 
            >
              <FontAwesome                 
                name='plus' 
              />
            </button>
          </label> 
          
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="north" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state[this.state.currentPole].colorList.map((item, index) => (
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
                              this.state[this.state.currentPole][item].color
                            )}
                          >                            
                            <header>
                              <h3>Color #{index + 1}</h3>
                              <label 
                                htmlFor="remove-color">Remove color
                                <button
                                  onClick={() => this.removeColor(item, index)} 
                                >
                                  <FontAwesome                         
                                    name='minus' 
                                  />
                                </button>
                              </label>
                            </header>
                            
                            <CirclePicker 
                              color={this.state[this.state.currentPole][item].color}
                              onChangeComplete={ this.handleColorChange(item) }
                            />

                            <h3>Time in milliseconds: {this.state[this.state.currentPole][item].duration}</h3>
                            <SliderTooltip 
                              max={1000}
                              min={1}
                              onAfterChange={this.handleTimeChange(item)}
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

        <Ball 
          colors={Array.from(this.state[this.state.currentPole].colorList, color => color = this.state[this.state.currentPole][color])}
          duration={this.state[this.state.currentPole].duration}
        />
      </div>
    );
  }
}

export default Controls;
