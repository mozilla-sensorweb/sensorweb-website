import * as React from 'react';
import * as d3 from 'd3';
import { renderOnResize, ResizeState } from './renderOnResize';
import { pickFromArray } from '../utils';
import moment from 'moment';
import { observable, action, asFlat } from 'mobx';
import { observer } from 'mobx-react';

import { Sensor, SensorReading } from '../state';
import { pmToColor, pmToGradientColor } from './colorScale';

interface HistorySvgGraphProps {
  data: SensorReading[];
  theme: 'light' | 'dark';
  mode: GraphMode;
}

type GraphMode = 'day' | 'week' | 'month';


@renderOnResize
class HistorySvgGraph extends React.Component<HistorySvgGraphProps, ResizeState> {
  margin = { top: 60, right: 20, bottom: 20, left: 20 };
  xAxis: SVGElement;
  //yAxis: SVGElement;
  path: SVGElement;
  area: SVGElement;
  gradient: SVGElement;
  averageLine: SVGElement;
  zoom: d3.ZoomBehavior<Element, {}>;
  zoomElement: SVGElement;
  //clipRect: SVGElement;
  pointerEl: SVGElement;
  xExtent: Date[];
  yExtent: number[];

  constructor(props: HistorySvgGraphProps) {
    super(props);
    this.updateExtent(props.data);
  }

  render() {
    console.log('Render history!')
    let stops: any[] = [];
    const steps = 5;
    const min = this.yExtent[0];
    const max = this.yExtent[1];

    for (let i = 0; i < steps; i++) {
      const progress = i / (steps - 1);
      const step = min + progress * (max - min);
      const opacity = progress;
      stops.push(<stop key={i} offset={(progress * 100 | 0)+ '%'} stopColor={pmToGradientColor(step)} stopOpacity={opacity} />);
    }
    return (
      <svg className={['HistorySvgGraph', this.props.theme].join(' ')} onMouseMove={this.onMouseMove as any}>
        <defs>
          {/*<clipPath id="clip">
            <rect ref={el => this.clipRect = el} width="0" height="0" />
          </clipPath>*/}
          <linearGradient ref={el => this.gradient = el} id="gradient" spreadMethod="pad" x1="0%" x2="0%" y1="100%" y2="0%">
            {stops}
          </linearGradient>
        </defs>
        <rect style={{pointerEvents: 'all', fill: 'none'}} x={0} y={0} width="100%" height="100%" />
        <g transform={`translate(${this.margin.left}, ${this.margin.top})`}>
          <rect style={{pointerEvents: 'all', fill: 'none'}} ref={el => this.zoomElement = el} />
          <line ref={ el => this.averageLine = el} className="averageLine" />
          <path ref={el => this.area = el} className="area" />
          <path ref={el => this.path = el} className="line" />
          <g ref={el => this.xAxis = el} className="axis axis--x" />
          {/*<g ref={el => this.yAxis = el} className="axis axis--y" />*/}
        </g>
        <g ref={el => this.pointerEl = el }>
          <g transform="matrix(0.337553,0,0,0.3367,-64.9789,-54.7138)">
            <path d="M251.75,162.5C284.451,162.5 311,189.049 311,221.75C311,254.451 250.75,311 250.75,311C250.75,311 192.5,254.451 192.5,221.75C192.5,189.049 219.049,162.5 251.75,162.5Z"
              />
          </g>
          <text className="pointerText" x="20" y="27">30</text>
        </g>
      </svg>
    );
  }
  componentDidMount() {
    //this.zoom = d3.zoom().on('zoom', this.onZoom.bind(this));
  }

  // onZoom() {
  //   this.componentDidUpdate();
  // }

  componentWillReceiveProps(nextProps: HistorySvgGraphProps) {
    this.updateExtent(nextProps.data);
  }

  updateExtent(data: SensorReading[]) {
    console.log('update extent!');
    this.xExtent = d3.extent(data, d => d.date) as Date[];
    this.yExtent = d3.extent(data, d => d.pm) as number[];
  }

  updatePointer(x: number) {
    let svg = this.pointerEl.ownerSVGElement;
    let pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = 0;
    pt = pt.matrixTransform(svg.getScreenCTM().inverse());
    pt.x = pt.x - this.margin.left;
    const width = this.state.width - this.margin.right - this.margin.left;
    let scale = d3.scaleLinear().domain([0, width]).rangeRound([0, this.props.data.length]);
    if (pt.x >= 0 && pt.x < width) {
      this.pointerEl.setAttribute('transform', `translate(${pt.x}, 10)`);
      const pm = this.props.data[scale(pt.x)].pm;
      this.pointerEl.setAttribute('fill', pmToColor(pm, 'light'));
      this.pointerEl.querySelector('.pointerText')!.textContent = pm + '';
    }
  }

  onMouseMove = (evt: MouseEvent) => {
    this.updatePointer(evt.clientX);
  }

  componentDidUpdate() {
    if (this.props.data.length < 2) {
      return;
    }
    const width = this.state.width - this.margin.right - this.margin.left;
    const height = this.state.height - this.margin.top - this.margin.bottom;
    const xExtent = this.xExtent;
    const xScale = d3.scaleTime()
      .range([0, width])
      .domain(xExtent);
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain(this.yExtent as number[]);

    let duration = moment.duration(xScale.domain()[1].getTime() - xScale.domain()[0].getTime());

    // TODO: extent based on mode

    let axis = d3.axisBottom(xScale).tickSize(0);

    switch (this.props.mode) {
      case 'day':
        axis.ticks(4).tickFormat(d => moment(d).format('h A'));
        break;
      case 'week':
        axis.ticks(7).tickFormat(d => moment(d).format('ddd'));
        break;
      case 'month':
        axis.ticks(4).tickFormat(d => moment(d).format('MMM D'));
        break;
    }

    let transform = d3.event ? d3.event.transform as d3.ZoomTransform : d3.zoomIdentity;
    d3.select(this.xAxis).call(axis.scale(transform.rescaleX(xScale as any)));

    let averagePm = d3.mean(this.props.data, d => d.pm);
    let avgY = yScale(averagePm!);
    d3.select(this.averageLine).attr('x1', 0).attr('x2', width).attr('y1', avgY).attr('y2', avgY);

 //   d3.select(this.yAxis).call(d3.axisLeft(yScale as any).tickSizeOuter(0).ticks(5))
    d3.select(this.zoomElement)
      .attr('width', width).attr('height', height)
      //.call(this.zoom);

    // this.zoom.scaleExtent([1, 30])
    //   .translateExtent([[0, 0], [width, height]])
    //   .extent([[0, 0], [width, height]])

    //d3.select(this.clipRect).attr('width', width).attr('height', height);

    const path = d3.line<SensorReading>()
        .curve(d3.curveBasis)
        .x(d => transform.rescaleX(xScale as any)(d.date))
        .y(d => yScale(d.pm))

    const area = d3.area<SensorReading>()
      .curve(d3.curveBasis)
      .x(d => transform.rescaleX(xScale as any)(d.date))
      .y1(d => yScale(d.pm))
      .y0(height);

    // this.path.attr("transform", d3.event.transform);
    // t.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    // gY.call(xScalAxis.scale(d3.event.transform.rescaleY(y)));

    this.xAxis.setAttribute('transform', `translate(0, ${height})`);
    d3.select(this.path)
      .attr('d', path(pickFromArray(this.props.data, width / 4)) || '')
      .attr('clip-path', 'url(#clip)');
    d3.select(this.area)
      .attr('d', area(pickFromArray(this.props.data, width / 4)) || '')
      .style('fill', 'url(#gradient)')
      .style('opacity', 0.4)
      .attr('clip-path', 'url(#clip)');
      //.attr('transform', 'scale(' + transform.k + ', 1)')

  }
}


interface HistoryGraphProps {
  sensor: Sensor;
  theme: 'light' | 'dark';
};

@observer
export default class HistoryGraph extends React.Component<HistoryGraphProps, {}> {
  @observable mode: GraphMode;
  @observable samples: SensorReading[] = asFlat([]);
  @observable loading: boolean = true;

  @action async setMode(mode: GraphMode) {
    this.loading = true;
    this.mode = mode;
    const start = moment().subtract(1, mode).toDate();
    const end = moment().toDate();
    //this.setSamples(await this.props.dataSource.getAirQualityData(start, end));
    this.setSamples(this.props.sensor.getReadings().filter((reading) => {
      return reading.date <= end && reading.date >= start;
    }));
  }

  @action setSamples(samples: SensorReading[]) {
    this.loading = false;
    this.samples = samples;
  }

  componentWillMount() {
    this.setMode('day');
  }

  componentWillReceiveProps(nextProps: HistoryGraphProps) {
    if (nextProps.sensor !== this.props.sensor) {
      this.setMode(this.mode);
    }
  }

  render() {
    let modeLink = (mode: GraphMode, label: string) =>
      <a href="#" className={this.mode === mode ? 'selected' : ''} onClick={() => this.setMode(mode)}>
        {label}
      </a>

    return <div className={['HistoryGraph', this.props.theme].join(' ')}>
      <div className="HistoryGraph__links">
        {modeLink('day', 'Day')}
        {modeLink('week', 'Week')}
        {modeLink('month', 'Month')}
      </div>
      <div className="HistoryGraph__header">
        <div>Sat Nov 5, 2:40</div>
      </div>
      <HistorySvgGraph data={this.samples} theme={this.props.theme} mode={this.mode} />
    </div>;
  }
}