import * as React from 'react';
import TWEEN, { Tween } from 'tween.js';

interface Props {
  value: number;
  duration?: number;
}
interface State {
  value: number;
}

// var coords = { x: 0, y: 0 };
// var tween = new TWEEN.Tween(coords)
//     .to({ x: 100, y: 100 }, 1000)
//     .onUpdate(function() {
//         console.log(this.x, this.y);
//     })
//     .start();

// requestAnimationFrame(animate);

// function animate(time) {
//     requestAnimationFrame(animate);
//     TWEEN.update(time);
// }

let animStartTime = 0;
function animationFrame() {
  if (TWEEN.update()) {
    requestAnimationFrame(animationFrame);
  }
}

function startAnimationLoopIfNecessary() {
  if (TWEEN.getAll().length === 1) {
    console.log('STARTING!');
    requestAnimationFrame(animationFrame);
  }
}

export default class NumberTween extends React.Component<Props, State> {
  static duration = 1000;
  currentTween?: Tween;
  constructor(props: Props) {
    super(props);
    this.state = { value: props.value };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.currentTween) {
      this.currentTween.stop();
    }
    const self = this;
    this.currentTween = new Tween({ value: this.state.value })
      .to(nextProps, this.props.duration || NumberTween.duration)
      .onUpdate(function() { self.setState(this); }) // 'this' is the updating value object
      .start();
    startAnimationLoopIfNecessary();
  }

  componentWillUnmount() {
    if (this.currentTween) {
      this.currentTween.stop();
    }
  }

  render() {
    return <span>{this.state.value | 0}</span>;
  }
}