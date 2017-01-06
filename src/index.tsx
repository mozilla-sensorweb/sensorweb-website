// These imports inject dependencies like CSS and index.html
import 'babel-polyfill';
import './index.html';
import './styles';

import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import SensorMap from './ui/map/SensorMap';
import STClient from './sensorthings';
import PageHeader from './ui/PageHeader';
import SensorDetailsPanel from './ui/SensorDetailsPanel';
import MobileHeader from './ui/MobileHeader';
import SensorListItem from './ui/SensorListItem';

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

  onClickSensor = (sensor?: Sensor) => {
    this.props.appState.viewSensor(sensor);
  };

  onClickDetails = () => {
    const sensor = this.props.appState.selectedSensor!;
    this.props.appState.viewSensorDetails(sensor);
  };
}


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


import { findLocation } from './findLocation';

findLocation().then((location) => {
  console.log('Current location:', location);
  appState.setCurrentGpsLocation(location);
});

ReactDOM.render(
  <Root appState={appState} />,
  document.getElementById('root')
);