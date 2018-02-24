import React, { Component } from 'react';
import './Ball.css';
import injectStyle from './injectStyle';

const NorthPole = (props) => (
  <section style={props.style} className="NorthPole">
    
  </section>
)

const SouthPole = () => (
  <section className="SouthPole">
    
  </section>
)

class Ball extends Component {
  constructor(props) {
    super(props);
  }

  createHemisphereStyle = () => {
    let styleObject = {};

    // keyframesStyle = `
    //     @-webkit-keyframes pulse {
    //       0%   { background-color: #fecd6d; }
    //       25%  { background-color: #ef7b88; }
    //       50%  { background-color: #acdacf; }
    //       75%  { background-color: #87c3db; }
    //       100% { background-color: #fecd6d; }
    //     }
    //   `;

    this.props.colors.map((color) => 
      styleObject.background = color.color
    );
    console.log(styleObject);
    return styleObject;
  }

  render() {
    let styleObj = this.createHemisphereStyle();     
    // injectStyle(styleObj);;

    return (
      <div className="Ball">
        <NorthPole style={styleObj} />
        <SouthPole />
      </div>
    );
  }
}

export default Ball;
