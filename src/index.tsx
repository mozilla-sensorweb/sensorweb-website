// These imports inject dependencies like CSS and index.html
import 'babel-polyfill';
import './index.html';
import './styles';

import React from 'react';
import ReactDOM from 'react-dom';
import { observer, Provider } from 'mobx-react';

import SensorMap from './ui/map/SensorMap';
import STClient from './sensorthings';
import PageHeader from './ui/PageHeader';
import SensorDetailsPanel from './ui/SensorDetailsPanel';
import MobileHeader from './ui/MobileHeader';
import SensorListItem from './ui/SensorListItem';
import Drawer from './ui/Drawer';
import SettingsModal from './ui/SettingsModal';
import FavoriteModal from './ui/FavoriteModal';

import { renderOnResize, ResizeState } from './ui/renderOnResize';
import { AppState, Sensor, Location } from './state';

const { default: styled, ThemeProvider } = require<any>('styled-components');

import { IntlProvider } from 'react-intl';
import { observable } from 'mobx';


const DrawerFavoriteListItem = styled.li`
  list-style: none;
  & .name {
    font-weight: bold;
  }
`;

@renderOnResize
@observer
class Root extends React.Component<{ appState: AppState }, ResizeState> {
  @observable expanded = true;
  @observable drawerOpened = false;
  @observable settingsOpened = false;

  constructor(props: any) {
    super(props);
    this.state = { width: 0, height: 0 };
  }

  render() {
    const appState = this.props.appState;
    const isMobile = (this.state.width < 500);
    const theme = {
      isMobile
    };

    const drawerContents = <div>
      <h1 style={{marginLeft: '27px', marginTop: '-7px'}}>Favorites</h1>
      <ul>
        {appState.settings.favoriteSensors.map((fav) => {
          const sensor = appState.knownSensors.get(fav.sensorId);
          if (!sensor) {
            return null;
          }
          return (
            <DrawerFavoriteListItem>
              <div className="name">{fav.name}</div>
              <div className="id">{sensor.currentPm}</div>
            </DrawerFavoriteListItem>
          );
        }).filter(el => !!el)}
      </ul>
    </div>;
    return (
      <Provider settings={appState.settings}>
        <IntlProvider locale={navigator.language}>
          <ThemeProvider theme={theme}>
            <Drawer open={this.drawerOpened} onClose={this.onCloseDrawer}
              contents={drawerContents}>
              <RootDiv>
                {this.settingsOpened && <SettingsModal settings={appState.settings} onClose={this.onCloseSettings} />}
                {appState.isFavoritingSensor && appState.selectedSensor &&
                  <FavoriteModal settings={appState.settings} sensor={appState.selectedSensor} onClose={() => appState.isFavoritingSensor = false } />}
                {/*!isMobile && <PageHeader />*/}
                <MobileHeader
                  searching={appState.isSearchingForLocation}
                  onToggleDrawer={this.onToggleDrawer}
                  drawerOpened={this.drawerOpened}
                  onOpenSettings={this.onClickSettings}
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
                      onClickFavorite={() => appState.isFavoritingSensor = true }
                      expanded={this.expanded}
                      sensor={appState.selectedSensor} />}
                </SensorAndMapList>
                {appState.viewingSensorDetails &&
                  <SensorDetailsPanel
                    onClose={() => appState.stopViewingSensorDetails()}
                    currentLocation={appState.currentGpsLocation}
                    sensor={appState.selectedSensor!} />}
              </RootDiv>
            </Drawer>
          </ThemeProvider>
        </IntlProvider>
      </Provider>
    );
  }

  onCloseDrawer = () => {
    this.drawerOpened = false;
  }

  onToggleDrawer = () => {
    this.drawerOpened = !this.drawerOpened;
  }

  onClickSettings = () => {
    this.settingsOpened = true;
  }

  onCloseSettings = () => {
    this.settingsOpened = false;
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