import React, { Component } from 'react';
import './Ball.css';
import injectStyle from './injectStyle';

class Ball extends Component {
  createNorthHemisphereStyle = (secondSide) => {
    if (!this.props.northColors.length) return;

    let styleObject,
      nextStartingPoint,
      colorToNotFade;

    styleObject = `@-webkit-keyframes north {`;

    this.props.northColors.map((color, index) => {
      if (!color || !color.duration) return true;

      nextStartingPoint = index > 1 ?
        (((color.duration / 1000) / this.props.northDuration) * 100) + nextStartingPoint :
        ((color.duration / 1000) / this.props.northDuration) * 100;

      if (colorToNotFade) styleObject += `${nextStartingPoint - 1}% { background-color: ${colorToNotFade.color}; }`;

      styleObject += `${index === 0 ? 0 : nextStartingPoint}% { background-color: ${color.color}; }`;
      
      color.fadeToNextColor ? 
        colorToNotFade = false :
        colorToNotFade = color;

      return styleObject;
    });

    if (colorToNotFade) styleObject += `99% { background-color: ${colorToNotFade.color}; }`;

    styleObject += `100% { background-color: ${this.props.northColors[0].color}; }}`;

    return styleObject;
  }

  createSouthHemisphereStyle = () => {
    if (!this.props.southColors.length) return;

    let styleObject,
        nextStartingPoint,
        colorToNotFade;

    styleObject = `@-webkit-keyframes south {`;

    this.props.southColors.map((color, index) => {
      if (!color || !color.duration) return true;

      nextStartingPoint = index > 1 ?
        (((color.duration / 1000) / this.props.southDuration) * 100) + nextStartingPoint :
        ((color.duration / 1000) / this.props.southDuration) * 100;

      if (colorToNotFade) styleObject += `${nextStartingPoint - 1}% { background-color: ${colorToNotFade.color}; }`;

      styleObject += `${index === 0 ? 0 : nextStartingPoint}% { background-color: ${color.color}; }`

      color.fadeToNextColor ? 
        colorToNotFade = false :
        colorToNotFade = color;

      return styleObject;
    });

    if (colorToNotFade) styleObject += `99% { background-color: ${colorToNotFade.color}; }`;

    styleObject += `100% { background-color: ${this.props.southColors[0].color}; }}`;

    return styleObject;
  }
 
  render() {
    let northFadeSpeed = this.props.northDuration / (this.props.northFade / 100),
      southFadeSpeed = this.props.southDuration / (this.props.southFade / 100);

    if (this.props.northColors && this.props.northColors[0].duration > 0) {
      let styleObj = this.createNorthHemisphereStyle();
      injectStyle(styleObj, 'north');
    }
    
    if (this.props.southColors && this.props.southColors[0].duration > 0) {
      let styleObj = this.createSouthHemisphereStyle();
      injectStyle(styleObj, 'south');
    }    

    let NorthPole = () => (
      <section style={{WebkitAnimation: `north ${northFadeSpeed}s ease infinite`}} className="NorthPole">
        
      </section>
    )
    
    let SouthPole = () => (
      <section style={{WebkitAnimation: `south ${southFadeSpeed}s ease infinite`}} className="SouthPole">
        
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
