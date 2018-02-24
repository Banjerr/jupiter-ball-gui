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
      colorNumber: 1,
      colorList: ['color1'],
      color1: {
        color: '#ffffff',
        duration: '2000',
        id: 'color1'
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
      this.state.colorList,
      result.source.index,
      result.destination.index
    );

    this.setState({
      colorList: items
    });
  }

  configureJupiter = (e) => {
    e.preventDefault();
  }  

  addColor = () => {
    let currentColorNumber = this.state.colorNumber,
      newPropName = 'color' + (currentColorNumber + 1) + Date.now();

    let stateObject = function() {
      let returnObj = this.state;
      returnObj['colorNumber'] = currentColorNumber + 1;
      returnObj['colorList'].push(newPropName);
      returnObj[newPropName] = {
        color: '#ffffff',
        duration: '2000',
        id: newPropName
      };
      return returnObj;
    }
  
    this.setState( stateObject ); 
  }

  removeColor = (color, index) => {
    let currentColorNumber = this.state.colorNumber,
      currentColorList = this.state.colorList;

    currentColorList.splice(index, 1);

    let stateObject = function() {
      let returnObj = this.state;
      returnObj['colorNumber'] = currentColorNumber > 0 ? 
        currentColorNumber - 1 : 0;
      returnObj['colorList'] = currentColorList;
      returnObj[color] = undefined;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleChangeComplete = (name) => (color) => {
    let stateObject = function() {
      let returnObj = this.state;
      returnObj[name].color = color.hex;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  handleTimeChange = (name) => (value) => {
    let stateObject = function() {
      let returnObj = this.state;
      returnObj[name].duration = value;
      return returnObj;
    };
    
    this.setState(stateObject);
  }

  render() {
    return (
      <div 
        className="Controls">
        <section>
          <p>Number of colors: {this.state.colorNumber}</p>

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
            <Droppable droppableId="droppable" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.colorList.map((item, index) => (
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
                              this.state[item].color
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
                              color={this.state[item].color}
                              onChangeComplete={ this.handleChangeComplete(item) }
                            />

                            <h3>Time (in milliseconds)</h3>
                            <SliderTooltip 
                              max={60}
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

        <Ball colors={Array.from(this.state.colorList, color => color = this.state[color])} />
      </div>
    );
  }
}

export default Controls;
