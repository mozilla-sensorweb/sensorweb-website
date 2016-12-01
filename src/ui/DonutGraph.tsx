import * as React from 'react';
import * as d3 from 'd3';
import { renderOnResize, ResizeState } from './renderOnResize';

interface DonutGraphProps {
  value: number;
  number: number;
}

@renderOnResize
export default class DonutGraph extends React.Component<DonutGraphProps, ResizeState> {
  g: SVGElement;
  foreground: SVGElement;
  background: SVGElement;
  label: SVGElement;
  units: SVGElement;

  render() {
    return (
      <svg className="PMGraph">
        <g ref={el => this.g = el}>
          <path ref={el => this.background = el} />
          <path ref={el => this.foreground = el} />
          <text ref={el => this.label = el} />
          <text ref={el => this.units = el} />
        </g>
      </svg>
    );
  }

  componentDidUpdate() {
    const radius = Math.min(this.state.width, this.state.height) / 2;

    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9)
      .startAngle(Math.PI);

    this.g.setAttribute('transform', `translate(${this.state.width / 2}, ${this.state.height / 2})`)
    d3.select(this.background)
      .datum({ endAngle: Math.PI * 3 })
      .style('fill', '#eee')
      .attr('d', arc as any);

    d3.select(this.foreground)
      .datum({ endAngle: this.props.value * (Math.PI * 2) + Math.PI })
      .style('fill', '#4c4')
      .attr('d', arc as any);

    d3.select(this.label)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 24)
      .attr('transform', `translate(0, -4)`)
      .text(this.props.number.toString());

    d3.select(this.units)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(0, ${radius * 0.35})`)
      .text('µg/m³');
  }
}