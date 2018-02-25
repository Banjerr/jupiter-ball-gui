import React, { Component } from 'react';
import './Ball.css';
import injectStyle from './injectStyle';

class Ball extends Component {
  createHemisphereStyle = () => {
    if (!this.props.colors.length) return;
    
    let styleObject = `@-webkit-keyframes pulse {`,
      nextStartingPoint;

    this.props.colors.map((color, index) => {
      if (!color.duration) return true;

      nextStartingPoint = index > 1 ?
        (((color.duration / 1000) / this.props.duration) * 100) + nextStartingPoint :
        ((color.duration / 1000) / this.props.duration) * 100;

      return styleObject += `${index === 0 ? 0 : nextStartingPoint}% { background-color: ${color.color}; }`
    });

    styleObject += `100% { background-color: ${this.props.colors[0].color}; }}`;

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
      <section style={{WebkitAnimation: `pulse ${this.props.duration}s ease infinite`}} className="SouthPole">
        
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
