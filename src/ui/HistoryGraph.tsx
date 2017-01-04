import * as React from 'react';
import * as d3 from 'd3';
import { renderOnResize, ResizeState } from './renderOnResize';
import { pickFromArray } from '../utils';
import moment from 'moment';
import { observable, action, asFlat } from 'mobx';
import { observer } from 'mobx-react';

import { Sensor, SensorReading } from '../state';
import { pmToColor, pmToGradientColor } from './colorScale';

const styled = require<any>('styled-components').default;

interface HistorySvgGraphProps {
  data: SensorReading[];
  theme: 'light' | 'dark';
  mode: GraphMode;
}

type GraphMode = 'hour' | 'day' | 'week' | 'month';

const StyledSvg = styled.svg`
  flex-grow: 1;
  min-height: 100px;
`;

const BottomAxis = styled.g`
  font-size: 12px;

  & text {
    font-family: Rubik, Arial;
    text-transform: uppercase;
    fill: black;
  }
`;

const PointerText = styled.text`
  fill: white;
  font-size: 20px;
  text-anchor: middle;
  font-family: Rubik, Arial;
`;

const AverageLine = styled.path`
  fill: none;
  stroke: black;
  stroke-width: 3px;
  opacity: 0.1;
`;
const Line = styled.path`
  fill: none;
  stroke: #333;
  stroke-width: 3px;
`;

@renderOnResize
class HistorySvgGraph extends React.Component<HistorySvgGraphProps, ResizeState> {
  margin = { top: 60, right: 20, bottom: 20, left: 20 };
  xAxis: SVGElement;
  //yAxis: SVGElement;
  path: SVGElement;
  gradient: SVGElement;
  averageLine: SVGElement;
  zoom: d3.ZoomBehavior<Element, {}>;
  zoomElement: SVGElement;
  //clipRect: SVGElement;
  pointerEl: SVGElement;
  pointerText: SVGElement;
  xExtent: Date[];
  yExtent: number[];

  constructor(props: HistorySvgGraphProps) {
    super(props);
    this.updateExtent(props);
  }

  render() {
    console.log('Render history!');
    if (this.props.data.length < 2) {
      return <div />;
    }
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
      <StyledSvg
        onMouseMove={this.onMouseMove as any}
        onTouchMove={this.onMouseMove as any}>
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
          <AverageLine innerRef={(el: any) => this.averageLine = el}  />
          <Line innerRef={(el: any) => this.path = el} />
          <BottomAxis innerRef={(el: any) => this.xAxis = el} />
          {/*<g ref={el => this.yAxis = el} className="axis axis--y" />*/}
        </g>
        <g ref={el => this.pointerEl = el }>
          <g transform="matrix(0.337553,0,0,0.3367,-64.9789,-54.7138)">
            <path d="M251.75,162.5C284.451,162.5 311,189.049 311,221.75C311,254.451 250.75,311 250.75,311C250.75,311 192.5,254.451 192.5,221.75C192.5,189.049 219.049,162.5 251.75,162.5Z"
              />
          </g>
          <PointerText innerRef={(el: any) => this.pointerText = el}
            x="20" y="27">30</PointerText>
        </g>
      </StyledSvg>
    );
  }
  componentDidMount() {
    //this.zoom = d3.zoom().on('zoom', this.onZoom.bind(this));
  }

  // onZoom() {
  //   this.componentDidUpdate();
  // }

  componentWillReceiveProps(nextProps: HistorySvgGraphProps) {
    this.updateExtent(nextProps);
  }

  modeToDuration = {
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 31,
  }

  updateExtent(props: HistorySvgGraphProps) {
    console.log('update extent!');
    this.xExtent = d3.extent(props.data, d => d.date) as Date[];
    //this.xExtent[0] = new Date(Math.min(this.xExtent[0].getTime(), Date.now() - (this.modeToDuration as any)[props.mode]));
    //this.xExtent[1] = new Date();
    console.log('extent', this.xExtent)
    this.yExtent = d3.extent(props.data, d => d.pm) as number[];
  }

  updatePointer(x: number) {
    const width = this.state.width - this.margin.right - this.margin.left;
    let scale = d3.scaleLinear().domain([0, width]).rangeRound([0, this.props.data.length - 1]);
    if (x >= 0 && x < width) {
      this.pointerEl.setAttribute('transform', `translate(${x}, 10)`);
      if (!this.props.data[scale(x)]) {
        console.log('DATA', x, scale(x), this.props.data.length);
      }
      const pm = this.props.data[scale(x)].pm;
      this.pointerEl.setAttribute('fill', pmToColor(pm, 'light'));
      this.pointerText.textContent = pm.toFixed(0) + '';
    }
  }


  onMouseMove = (evt: any) => {
    let svg = this.pointerEl.ownerSVGElement;
    let pt = svg.createSVGPoint();
    pt.x = evt.touches ? evt.touches[0].pageX : evt.pageX;
    pt.y = 0;
    pt = pt.matrixTransform(svg.getScreenCTM().inverse());
    pt.x = pt.x - this.margin.left;
    this.updatePointer(pt.x);
    evt.stopPropagation(); // xxx
    evt.preventDefault();
  }

  componentDidUpdate() {
    if (this.props.data.length < 2) {
      return;
    }
    const width = this.state.width - this.margin.right - this.margin.left;
    const height = this.state.height - this.margin.top - this.margin.bottom;
    const xScale = d3.scaleTime()
      .range([0, width])
      .domain(this.xExtent);
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain(this.yExtent as number[]);

    let duration = moment.duration(xScale.domain()[1].getTime() - xScale.domain()[0].getTime());

    // TODO: extent based on mode

    let axis = d3.axisBottom(xScale).tickSize(0);

    switch (this.props.mode) {
      case 'hour':
        axis.ticks(3).tickFormat(d => moment(d).format('h:mm A'));
        break;
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

    // this.path.attr("transform", d3.event.transform);
    // t.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    // gY.call(xScalAxis.scale(d3.event.transform.rescaleY(y)));

    this.xAxis.setAttribute('transform', `translate(0, ${height})`);
    d3.select(this.path)
      .attr('d', path(pickFromArray(this.props.data, width / 4)) || '')
      .attr('clip-path', 'url(#clip)');
      //.attr('transform', 'scale(' + transform.k + ', 1)')

    this.updatePointer(width * .5);

  }
}


interface HistoryGraphProps {
  sensor: Sensor;
  theme: 'light' | 'dark';
};

@observer
export default class HistoryGraph extends React.Component<HistoryGraphProps, {}> {
  @observable mode: GraphMode;

  @action async setMode(mode: GraphMode) {
    this.mode = mode;
  }

  componentWillMount() {
    this.setMode('day');
  }

  render() {
    const start = moment().subtract(1, this.mode).toDate();
    const end = moment().toDate();
    const samples = this.props.sensor.knownReadings.filter((reading, i) => reading.date <= end && reading.date >= start);

    let modeLink = (mode: GraphMode, label: string) =>
      <Link href="#"
         selected={this.mode === mode}
         onClick={() => this.setMode(mode)}>
        {label}
      </Link>;

    return <HistoryGraphStyled>
      <Links>
        {modeLink('hour', 'Hour')}
        {modeLink('day', 'Day')}
        {modeLink('week', 'Week')}
        {modeLink('month', 'Month')}
      </Links>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div>Sat Nov 5, 2:40</div>
      </div>
      <HistorySvgGraph data={samples} theme={this.props.theme} mode={this.mode} />
    </HistoryGraphStyled>;
  }
}

const HistoryGraphStyled = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 1rem;
`;

const Links = styled.div`
  text-align: right;
`;

const Link = styled.a`
  display: inline-block;
  padding: 0.5rem 0.8rem;
  color: ${(props: any) => props.selected ? '#fff' : '#666'};
  background-color: ${(props: any) => props.selected ? '#666' : 'transparent'};
  border-radius: 3px;
  text-decoration: none;
`;

