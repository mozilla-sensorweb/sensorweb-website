// These imports inject dependencies like CSS and index.html
import 'babel-polyfill';
import './index.css';
import 'file?name=[name].[ext]!./index.html';

import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { action, useStrict, observable } from 'mobx';
useStrict(true);

import { bem } from './utils';

import DonutGraph from './ui/DonutGraph';
import Sidebar from './ui/Sidebar';
import SensorMap from './ui/SensorMap';
import * as d3 from 'd3';
import moment, { Moment } from 'moment';

import STClient from './sensorthings';


function AirPollutionIndex({ value }: { value: number }) {

  const COLORS = ['#77E15F', '#6CBC4B', '#0FA14A', '#F1EB45', '#F6BD4A',
                  '#FE9239', '#F25253', '#FD0031', '#CF0606', '#DC32FF'];

  let scale = d3.scaleThreshold()
    .domain([12, 24, 36, 42, 48, 54, 59, 65, 70])
    .range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let activeIndex = scale(value);

  let rects = COLORS.map((color, index) => (
    <span key={index} className={['AirPollutionIndex__rect',
      index === activeIndex ? 'AirPollutionIndex__rect--active' : null].join(' ')}
      style={{backgroundColor: color}}>
      {index === activeIndex ? value : null}
    </span>
  ));

  return <div className="AirPollutionIndex">
    <div className="AirPollutionIndex__bar">
      {rects}
    </div>
    <div className="AirPollutionIndex__desc">
      <span style={{color: COLORS[1], width: '30%'}}>1-35 Low</span>
      <span style={{color: COLORS[4], width: '30%'}}>36-54 Moderate</span>
      <span style={{color: COLORS[7], width: '30%'}}>55-70 High</span>
      <span style={{color: COLORS[9], width: '10%'}}>&gt;70</span>
    </div>

  </div>;
}

import { renderOnResize, ResizeState } from './ui/renderOnResize';
import { RootState, Sensor, Location } from './state';

@renderOnResize
@observer
class Root extends React.Component<{ appState: RootState }, ResizeState> {
  constructor(props: any) {
    super(props);
    this.state = { width: 0, height: 0 };
  }

  render() {
    const appState = this.props.appState;
    const isMobile = (this.state.width < 500);
    return <div className={['root', isMobile ? 'mobile' : 'desktop'].join(' ')}>
      <div className="PageHeader MainSection">
        <h1>SensorWeb</h1>
        <div className="PageHeader__links">
          <a href="#">Contribute!</a>
          <a href="#">Help</a>
          <a href="#">Sign in / Join</a>
        </div>
      </div>
      <div className="PageBody">
        <SensorMap
          currentGpsLocation={appState.currentGpsLocation}
          knownSensors={appState.knownSensors}
          selectedSensor={appState.selectedSensor}
          onClickSensor={this.onClickSensor} />
        <Sidebar
          currentLocation={appState.currentGpsLocation}
          isMobile={isMobile}
          selectedSensor={appState.selectedSensor}
           />
      </div>
    </div>;
  }

  onClickSensor = (sensor: Sensor) => {
    this.props.appState.viewSensor(sensor);
  };
}


let appState = new RootState();
window.addEventListener('READY', async () => {
  const client = new STClient();
  appState.learnAboutSensors(await client.loadAll());
});

(window as any).appState = appState;


import { findLocation } from './location';

findLocation().then((location) => {
  appState.setCurrentGpsLocation(location);
});

ReactDOM.render(
  <Root appState={appState} />,
  document.getElementById('root')
);