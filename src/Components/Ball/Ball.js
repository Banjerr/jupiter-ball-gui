import React, { Component } from 'react';
import './Ball.css';
import injectStyle from './injectStyle';

class Ball extends Component {
  createHemisphereStyle = () => {
    let styleObject = `@-webkit-keyframes pulse {`,
      totalTime = 0;

    this.props.colors.map((color) => totalTime = totalTime + color.duration);

    this.props.colors.map((color, index) => 
      styleObject += `${index === 0 ? 0 : (100 - color.duration)}% { background-color: ${color.color}; }`
    );

    styleObject += `100% { background-color: ${this.props.colors[0].color}; }}`;
    console.log(styleObject);
    return styleObject;
  }

  render() {
    let styleObj = this.createHemisphereStyle();     
    injectStyle(styleObj);

    let NorthPole = () => (
      <section style={{WebkitAnimation: `pulse ${this.props.duration}s ease infinite`}} className="NorthPole">
        
      </section>
    )
    
    let SouthPole = () => (
      <section className="SouthPole">
        
      </section>
    )

    return (
      <div className="Ball">
        <NorthPole />
        <SouthPole />
      </div>
    );
  }
}

export default Ball;
