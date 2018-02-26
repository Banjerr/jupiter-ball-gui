import React, { Component } from 'react';
import './Ball.css';
import injectStyle from './injectStyle';

class Ball extends Component {
  createNorthHemisphereStyle = (secondSide) => {
    if (!this.props.northColors.length) return;

    let styleObject,
      nextStartingPoint;

    styleObject = `@-webkit-keyframes north {`;

    this.props.northColors.map((color, index) => {
      if (!color || !color.duration) return true;

      nextStartingPoint = index > 1 ?
        (((color.duration / 1000) / this.props.northDuration) * 100) + nextStartingPoint :
        ((color.duration / 1000) / this.props.northDuration) * 100;

      return styleObject += `${index === 0 ? 0 : nextStartingPoint}% { background-color: ${color.color}; }`
    });

    styleObject += `100% { background-color: ${this.props.northColors[0].color}; }}`;

    return styleObject;
  }

  createSouthHemisphereStyle = () => {
    if (!this.props.southColors.length) return;

    let styleObject,
        nextStartingPoint;

    styleObject = `@-webkit-keyframes south {`;

    this.props.southColors.map((color, index) => {
      if (!color || !color.duration) return true;

      nextStartingPoint = index > 1 ?
        (((color.duration / 1000) / this.props.southDuration) * 100) + nextStartingPoint :
        ((color.duration / 1000) / this.props.southDuration) * 100;

      return styleObject += `${index === 0 ? 0 : nextStartingPoint}% { background-color: ${color.color}; }`
    });

    styleObject += `100% { background-color: ${this.props.southColors[0].color}; }}`;

    return styleObject;
  }
 
  render() {
    if (this.props.northColors[0].duration > 0) {
      let styleObj = this.createNorthHemisphereStyle();
      injectStyle(styleObj, 'north');
    }
    
    if (this.props.southColors[0].duration > 0) {
      let styleObj = this.createSouthHemisphereStyle();
      injectStyle(styleObj, 'south');
    }

    let NorthPole = () => (
      <section style={{WebkitAnimation: `north ${this.props.northDuration}s ease infinite`}} className="NorthPole">
        
      </section>
    )
    
    let SouthPole = () => (
      <section style={{WebkitAnimation: `south ${this.props.southDuration}s ease infinite`}} className="SouthPole">
        
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
