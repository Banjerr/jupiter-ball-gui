import React from 'react';
import ReactDOM from 'react-dom';
import BallEditor from './BallEditor';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BallEditor />, div);
  ReactDOM.unmountComponentAtNode(div);
});
