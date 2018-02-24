import React, { Component } from 'react';
import './App.css';
import Ball from '../Ball/Ball.js';
import Controls from '../Controls/Controls.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Controls />
        <Ball />
      </div>
    );
  }
}

export default App;
