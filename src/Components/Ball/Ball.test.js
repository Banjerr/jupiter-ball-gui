import React from 'react';
import ReactDOM from 'react-dom';
import Ball from './Ball';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Ball />, div);
  ReactDOM.unmountComponentAtNode(div);
});
