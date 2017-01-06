import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * Automatically rerender the component when the window resizes.
 * Your React.Component should define its state as a `ResizeState` interface.
 */
export function renderOnResize<P>(target: React.ComponentClass<P>) {
  let componentDidMount = target.prototype.componentDidMount;
  let componentWillUnmount = target.prototype.componentWillUnmount;
  let resizeHandler: () => void;
  target.prototype.componentDidMount = function() {
    resizeHandler = () => {
      const node = ReactDOM.findDOMNode(this);
      const bounds = node.getBoundingClientRect();
      if (!this.state || this.state.width !== bounds.width || this.state.height !== bounds.height) {
        this.setState({ width: bounds.width, height: bounds.height });
      }
    }
    window.addEventListener('resize', resizeHandler);
    componentDidMount && componentDidMount.call(this);
    resizeHandler();
  }
  target.prototype.componentWillUnmount = function() {
    resizeHandler && window.removeEventListener('resize', resizeHandler);
    componentWillUnmount && componentWillUnmount.call(this);
  }
  console.log('target', target);
}

export interface ResizeState {
  width: number;
  height: number;
}