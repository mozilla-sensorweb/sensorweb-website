import * as React from 'react';

function now() {
  return window.performance ? window.performance.now() : Date.now();
}
export class Point {
  time: number;
  constructor(public x: number, public y: number) {
    this.time = now();
  }
}

function eventToPoint(event: any): Point {
  if (event.touches) {
    return new Point(event.touches[0].pageX, event.touches[0].pageY);
  } else {
    return new Point(event.pageX, event.pageY);
  }
}

interface DraggableDelegate {
  start(): void;
  update(delta: Point): void;
  end(): void;
}

export class Draggable {
  startPoint?: Point;
  currentPoint: Point;
  previousPoint: Point;
  velocity: Point;

  constructor(public el: HTMLElement, public delegate: DraggableDelegate) {
    this.el.addEventListener('touchstart', this);
    this.el.addEventListener('touchmove', this);
    this.el.addEventListener('touchend', this);
    this.el.addEventListener('touchcancel', this);
    this.el.addEventListener('mousedown', this);
    this.el.addEventListener('mousemove', this);
    this.el.addEventListener('mouseup', this);
  }

  destroy() {
    this.el.removeEventListener('touchstart', this);
    this.el.removeEventListener('touchmove', this);
    this.el.removeEventListener('touchend', this);
    this.el.removeEventListener('touchcancel', this);
    this.el.removeEventListener('mousedown', this);
    this.el.removeEventListener('mousemove', this);
    this.el.removeEventListener('mouseup', this);
  }

  handleEvent(event: Event) {
    switch (event.type) {
      case 'touchstart':
      case 'mousedown':
        this.startPoint = eventToPoint(event);
        this.currentPoint = this.startPoint;
        this.previousPoint = this.startPoint;
        this.delegate.start();
        event.preventDefault();
        event.stopPropagation();
        break;
      case 'touchmove':
      case 'mousemove':
        if (!this.startPoint) {
          break;
        }
        this.previousPoint = this.currentPoint;
        this.currentPoint = eventToPoint(event);
        let delta = new Point(this.currentPoint.x - this.previousPoint.x, this.currentPoint.y - this.previousPoint.y);
        this.delegate.update(delta);
        break;
      case 'mouseup':
      case 'touchend':
      case 'touchcancel':
        this.delegate.end();
        this.startPoint = undefined;
        break;
    }
  }
}


export class SlidePanel extends React.Component<{}, {}> {
  draggable: Draggable;
  el: HTMLElement;

  render() {
    return <div ref={el => this.el = el}>
      {this.props.children}
    </div>;
  }
}