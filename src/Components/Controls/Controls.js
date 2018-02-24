import React, { Component } from 'react';
import './Controls.css';
import FontAwesome from 'react-fontawesome';

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

  render() {
    return (
      <div className="Controls">
        <section>
          <p>Number of colors: {this.state.colorNumber}</p>
        </section>
        <form onSubmit={this.configureJupiter}>
          <label htmlFor="add-color">Add color
            <button>
              <FontAwesome onClick={this.addColor} name='plus' />
            </button>
          </label>          

          {
            this.state.colorList.map((color, i) => 
              <section key={i} className={color}>
                <label htmlFor="remove-color">Remove color
                  <button>
                    <FontAwesome onClick={() => this.removeColor(color, i)} name='minus' />
                  </button>
                </label>
              </section>
            )
          }
        </form>
      </div>
    );
  }
}

export default Controls;
