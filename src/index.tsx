// These imports inject dependencies like CSS and index.html
import 'babel-polyfill';
import './index.html';
import './styles';

import React from 'react';
import ReactDOM from 'react-dom';
import { observer, Provider } from 'mobx-react';

import STClient from './sensorthings';
import FavoritesPane from './ui/FavoritesPane';
import MapPane from './ui/MapPane';
import SearchPane from './ui/SearchPane';
import TabbedInterface from './ui/TabbedInterface';
import SettingsModal from './ui/SettingsModal';
import FavoriteModal from './ui/FavoriteModal';
import UnfavoriteModal from './ui/UnfavoriteModal';

import { renderOnResize, ResizeState } from './ui/renderOnResize';
import { AppState, Sensor, Location, Tabs } from './state';

const { default: styled, ThemeProvider } = require<any>('styled-components');

import { IntlProvider } from 'react-intl';
import { observable } from 'mobx';

import { config as themeConfig } from './ui/theme';
import Toast from './ui/Toast';

import TransitionGroup from 'react-addons-transition-group'

//(window as any).React = React; // enable react devtools

@renderOnResize
@observer
class Root extends React.Component<{ appState: AppState }, ResizeState> {
  @observable expanded = true;
  @observable drawerOpened = false;

  constructor(props: any) {
    super(props);
    this.state = { width: 0, height: 0 };
  }

  render() {
    const appState = this.props.appState;
    const isMobile = (this.state.width < 500);
    const theme: any = {
      isMobile,
      ...themeConfig
    };

    return (
      <Provider settings={appState.settings}>
        <IntlProvider locale={navigator.language}>
          <ThemeProvider theme={theme}>
            <RootDiv>
              <TransitionGroup>{appState.currentToast && <Toast>{appState.currentToast}</Toast>}</TransitionGroup>
              {appState.showingSettingsPanel && <SettingsModal settings={appState.settings} onClose={this.onCloseSettings} />}
              {appState.isFavoritingSensor && appState.selectedSensor &&
                <FavoriteModal settings={appState.settings} sensor={appState.selectedSensor}
                onClose={(saved: boolean) => {
                  appState.isFavoritingSensor = false;
                  if (saved) {
                    appState.toast('Sensor Saved.');
                  }
                }} />}
              {appState.isUnfavoritingSensor && appState.selectedSensor &&
                <UnfavoriteModal settings={appState.settings} sensor={appState.selectedSensor}
                onClose={(saved: boolean) => {
                  appState.isUnfavoritingSensor = false;
                  if (saved) {
                    appState.toast('Sensor Removed.');
                  }
                }} />}
              {/*!isMobile && <PageHeader />*/}
                <TabbedInterface
                  selectedTab={appState.currentTab}
                  onSelectedTab={(index) => appState.currentTab = index}
                  labels={['Favorites', 'Map', 'Search']}>
                  <FavoritesPane appState={appState} />
                  <MapPane appState={appState} />
                  <SearchPane appState={appState} />
                </TabbedInterface>
            </RootDiv>
          </ThemeProvider>
        </IntlProvider>
      </Provider>
    );
  }

  onCloseSettings = () => {
    appState.showingSettingsPanel = false;
  }
}


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