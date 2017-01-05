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
import SensorDetailsPanel from './ui/SensorDetailsPanel';
import MobileHeader from './ui/MobileHeader';

import { renderOnResize, ResizeState } from './ui/renderOnResize';
import { AppState, Sensor, Location } from './state';

const { default: styled, ThemeProvider } = require<any>('styled-components');

import { observable } from 'mobx';

@renderOnResize
@observer
class Root extends React.Component<{ appState: AppState }, ResizeState> {
  @observable expanded = true;

  constructor(props: any) {
    super(props);
    this.state = { width: 0, height: 0 };
  }

  render() {
    const appState = this.props.appState;
    const isMobile = (this.state.width < 500);
    const theme = {
      isMobile,
    };
    return (
      <ThemeProvider theme={theme}>
        <RootDiv>
          {!isMobile && <PageHeader />}
          <MobileHeader
            searching={appState.isSearchingForLocation}
            onSearch={appState.searchForLocation.bind(appState)} />
          <SensorAndMapList>
            <SensorMap
              style={{width: '100%', flexGrow: 1}}
              currentGpsLocation={appState.currentGpsLocation}
              knownSensors={appState.knownSensors}
              selectedSensor={appState.selectedSensor}
              onMapLoaded={appState.onMapLoaded.bind(appState)}
              onClickSensor={this.onClickSensor} />
            {appState.selectedSensor &&
              <SensorListItem
                onClickExpand={() => { /*this.expanded = !this.expanded;*/ }}
                onClickDetails={this.onClickDetails}
                expanded={this.expanded}
                sensor={appState.selectedSensor} />}
          </SensorAndMapList>
          {appState.viewingSensorDetails &&
            <SensorDetailsPanel
              onClose={() => appState.stopViewingSensorDetails()}
              currentLocation={appState.currentGpsLocation}
              sensor={appState.selectedSensor!} />}
        </RootDiv>
      </ThemeProvider>
    );
  }

  onClickSensor = (sensor: Sensor) => {
    this.props.appState.viewSensor(sensor);
  };

  onClickDetails = () => {
    const sensor = this.props.appState.selectedSensor!;
    this.props.appState.viewSensorDetails(sensor);
  };
}

import { pmToColor } from './ui/colorScale';
interface SensorListItemProps {
  sensor: Sensor;
  className: string;
  onClickExpand: any;
  onClickDetails: any;
  expanded: boolean;
}
const SensorListItem = styled(class extends React.Component<SensorListItemProps, any> {
  render() {
    const sensor = this.props.sensor;
    const color = pmToColor(sensor.currentPm, 'light');
    const temp = sensor.currentTemperature;
    const humidity = sensor.currentHumidity;

    let faceIcon;
    let qualityText;
    if (sensor.currentPm < 36) {
      faceIcon = require<string>('./assets/face-great.svg');
      qualityText = 'Great Air Quality';
    } else if (sensor.currentPm < 59) {
      faceIcon = require<string>('./assets/face-moderate.svg');
      qualityText = 'Moderate Quality';
    } else {
      faceIcon = require<string>('./assets/face-bad.svg');
      qualityText = 'Bad Air Quality';
    }

    return <div className={this.props.className} onClick={this.props.onClickExpand}>
      <div className="row">
        <img className="icon"
          src={faceIcon}
          style={{ backgroundColor: color, borderRadius: '5px' }} />
        <div>
          <div className="sensorName">A Sensor</div>
          <div className="qualityText" style={{color: color}}>{qualityText}</div>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', borderLeft: '1px solid #ddd', paddingLeft: '0.5rem' }}>
          <img
            src={require<string>('./assets/sun-icon.svg')}
            style={{width: '3rem', height: '3rem'}} />
          <div>
            <div className="temp">{temp && temp.toFixed() || '--'}<span className="unit">°C</span></div>
            <div><img src={require<string>('./assets/humidity-icon.svg')} style={{width: '1em', height: '1em', position: 'relative', top: '2px'}} />
              {humidity && humidity.toFixed() || '--'}<span className="unit">%</span>
              </div>
          </div>
        </div>
      </div>
      {this.props.expanded && <div className="row" style={{marginTop: '0.5rem'}}>
        <img className="ss-icon" src={require<string>('./assets/share-icon.svg')} />
        <img className="ss-icon" src={require<string>('./assets/star-icon.svg')} />
        <a className="details-link" style={{marginLeft: 'auto'}}
          onClick={this.props.onClickDetails}>Sensor Details ></a>
      </div>}
    </div>;
  }
})`
  background: white;
  color: black;
  padding: 0.5rem;

  display: flex;
  flex-direction: column;

  transition: all 1s ease;

  & .sensorName {
    font-size: 1.3rem;
  }

  & .qualityText {
    text-transform: uppercase;
  }

  & .row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  & .temp {
    font-size: 1.3em;
  }
  & .unit {
    opacity: 0.6;
  }

  & .icon {
    width: 3rem;
    height: 3rem;
    margin-right: 0.5rem;
  }

  & .ss-icon {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }

  & .details-link {
    color: #039;
    padding: 0 1rem;
  }
`;

const SensorAndMapList = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;

`;

const RootDiv = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  background: #E3ECF1;
  height: 100%;
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
    font-size: inherit;
    font-weight: inherit;
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