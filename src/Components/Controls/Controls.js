import React, { Component } from 'react';
import Ball from '../Ball/Ball.js';
import './Controls.css';
import FontAwesome from 'react-fontawesome';
import { SwatchesPicker } from 'react-color';

class Controls extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      colorNumber: 1,
      colorList: ['color1'],
      color1: {
        color: '#ffffff',
        duration: '2000',
        orderNumber: 1
      }
    }
  }

  configureJupiter = (e) => {
    e.preventDefault();
    console.log('form')
  }  

  addColor = () => {
    let currentColorNumber = this.state.colorNumber,
      newPropName = 'color' + (currentColorNumber + 1);

    let stateObject = function() {
      let returnObj = this.state;
      returnObj['colorNumber'] = currentColorNumber + 1;
      returnObj['colorList'].push(newPropName);
      returnObj[newPropName] = {
        color: '#ffffff',
        duration: '2000',
        orderNumber: currentColorNumber + 1
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
        </section>
        <form 
          onSubmit={this.configureJupiter}>

          <label htmlFor="add-color">Add color
            <button
              onClick={this.addColor} 
            >
              <FontAwesome                 
                name='plus' 
              />
            </button>
          </label>    

          {
            this.state.colorList.map((colorName, i) => 
              <section 
                key={i} 
                id={colorName}
              >
                <header>
                  <h3>#{i + 1}</h3>
                  <label 
                    htmlFor="remove-color">Remove color
                    <button
                      onClick={() => this.removeColor(colorName, i)} 
                    >
                      <FontAwesome                         
                        name='minus' 
                      />
                    </button>
                  </label>
                </header>
                <SwatchesPicker 
                  color={this.state[colorName].color}
                  onChangeComplete={ this.handleChangeComplete(colorName) }
                />
              </section>
            )
          }
        </form>

        <Ball />
      </div>
    );
  }
}

export default Controls;
