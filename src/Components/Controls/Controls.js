import React, { Component } from 'react';
import Ball from '../Ball/Ball.js';
import './Controls.css';
import FontAwesome from 'react-fontawesome';
import { SwatchesPicker } from 'react-color';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  console.log(result);
  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

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
        duration: '2000'
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
        duration: '2000'
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
    console.log(color.hex);
    console.log(name);

    let stateObject = function() {
      let returnObj = this.state;
      returnObj[name].color = color.hex;
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
                              provided.draggableProps.style
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
                            <SwatchesPicker 
                              color={this.state[item].color}
                              onChangeComplete={ this.handleChangeComplete(item) }
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

        <Ball />
      </div>
    );
  }
}

export default Controls;
