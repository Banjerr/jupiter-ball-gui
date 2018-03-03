import React, { Component } from 'react';
import './App.css';
import { Container } from 'semantic-ui-react';
import BallEditor from '../BallEditor/BallEditor.js';
import Controls from '../Controls/Controls.js';

class App extends Component {
  render() {
    return (
      <Container className="App">
        <BallEditor />
        {/* <Controls /> */}
      </Container>
    );
  }
}

export default App;
