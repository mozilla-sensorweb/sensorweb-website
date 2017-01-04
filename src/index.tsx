// These imports inject dependencies like CSS and index.html
import 'babel-polyfill';
import './index.html';
import './ui/fonts';

import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import Sidebar from './ui/Sidebar';
import SensorMap from './ui/SensorMap';
import STClient from './sensorthings';
import PageHeader from './ui/PageHeader';

import { renderOnResize, ResizeState } from './ui/renderOnResize';
import { AppState, Sensor, Location } from './state';

const { default: styled } = require<any>('styled-components');

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
    return <RootDiv>
      <PageHeader />
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0
      }}>
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
    </RootDiv>;
  }

  onSetLocation = (location: Location) => {
    this.props.appState.setViewingLocation(location);
  }

  onClickSensor = (sensor: Sensor) => {
    this.props.appState.viewSensor(sensor);
  };
}

const RootDiv = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  padding: 0.5rem;
  background: #E3ECF1;
`;

const { injectGlobal } = require<any>('styled-components');

injectGlobal`
  /*** Default to "box-sizing: border-box" ***/
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
    margin: 0;
    padding: 0;
  }

  /* Use single-direction margins.
  // h1, h2, h3, h4, h5, h6, p, ol, ul, dl, pre {
    // margin-top: 0;
  // }*/

  html {
    font-family: Rubik, Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.4;
  }

  * {
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }



  /* Hide the placeholder text when an input is focused. */
  input:focus::-webkit-input-placeholder { color:transparent; }
  input:focus::-moz-placeholder { color:transparent; } /* FF 19+ */
  input:focus:-ms-input-placeholder { color:transparent; } /* IE 10+ */


  body {
    background: #fff;
    position: fixed;
    width: 100%;
    height: 100%;
    -webkit-touch-callout: none;
    -webkit-text-size-adjust: none;
    user-select: none;
    overflow: hidden;
  }
`;

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