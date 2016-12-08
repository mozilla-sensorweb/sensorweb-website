// These imports inject dependencies like CSS and index.html
import 'babel-polyfill';
import './assets/index.css';
import 'file?name=[name].[ext]!./index.html';

import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import Sidebar from './ui/Sidebar';
import SensorMap from './ui/SensorMap';
import STClient from './sensorthings';

import { renderOnResize, ResizeState } from './ui/renderOnResize';
import { AppState, Sensor, Location } from './state';

@renderOnResize
@observer
class Root extends React.Component<{ appState: AppState }, ResizeState> {
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
          onSetLocation={this.onSetLocation}
          onClickSensor={this.onClickSensor} />
        <Sidebar
          currentLocation={appState.currentGpsLocation}
          isMobile={isMobile}
          selectedSensor={appState.selectedSensor} />
      </div>
    </div>;
  }

  onSetLocation = (location: Location) => {
    this.props.appState.setViewingLocation(location);
  }

  onClickSensor = (sensor: Sensor) => {
    this.props.appState.viewSensor(sensor);
  };
}


let appState = new AppState();
window.addEventListener('READY', async () => {
  const client = new STClient();
  const sfSensor = Sensor.random();
  sfSensor.location = new Location(37.789418, -122.389319);
  sfSensor.populateWithFakeReadings();
  sfSensor.fleshOutFakeReadings();
  appState.learnAboutSensors([sfSensor]);
  appState.learnAboutSensors(await client.loadAll());
});

(window as any).appState = appState;


import { findLocation } from './location';

findLocation().then((location) => {
  console.log('Current location:', location);
  appState.setCurrentGpsLocation(location);
});

ReactDOM.render(
  <Root appState={appState} />,
  document.getElementById('root')
);