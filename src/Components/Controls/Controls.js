import React, { Component } from 'react';
import './Controls.css';
import FontAwesome from 'react-fontawesome';

class Controls extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      colorNumber: props.initialColorNumber ?
        props.initialColorNumber : 1
    }
  }

  configureJupiter = (e) => {
    e.preventDefault();
    console.log('form')
  }

  addColor = () => {
    this.setState({
      colorNumber: this.state.colorNumber + 1
    })
  }

  removeColor = () => {
    this.setState({
      colorNumber: this.state.colorNumber > 0 ? 
        this.state.colorNumber - 1 : 0
    })
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
          <label htmlFor="remove-color">Remove color
            <button>
              <FontAwesome onClick={this.removeColor} name='minus' />
            </button>
          </label>
        </form>
      </div>
    );
  }
}

export default Controls;
