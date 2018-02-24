import React, { Component } from 'react';
import './Ball.css';

const NorthPole = () => (
  <section className="NorthPole">

  </section>
)

const SouthPole = () => (
  <section className="SouthPole">
    
  </section>
)

class Ball extends Component {
  render() {
    return (
      <div className="Ball">
        <NorthPole />
        <SouthPole />
      </div>
    );
  }
}

export default Ball;
