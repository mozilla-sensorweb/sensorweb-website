import * as React from 'react';
const { default: styled } = require<any>('styled-components');
import { SensorRowSummary, FaceIcon } from './DetailsDrawer';
import { AppState, Sensor } from '../state';

import Settings, { FavoriteSensor } from '../state/settings';
import { themed } from './theme';
import { List, ListItem, EmptyListItem } from './lists';
import { observer } from 'mobx-react';
import { action, observable, computed } from 'mobx';
import SpriteIcon, { Icon } from './SpriteIcon';

interface FavoritesPaneProps {
  appState: AppState;
}

const SensorListItem = styled(ListItem)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 6rem;
`;

class EditingState {
  @observable newSensorNames = new Map<Sensor, string>();
  constructor(public settings: Settings) {

  }

  rename(sensor: Sensor, newName: string) {
    this.newSensorNames.set(sensor, newName);
  }

  commit() {
    this.newSensorNames.forEach((name, sensor) => {
      let fav = this.settings.getFavoriteSensor(sensor)!;
      console.log('commit', name, sensor)
      if (name) {
        fav.name = name;
      }
    });
  }
}

@observer
export default class FavoritesPane extends React.Component<FavoritesPaneProps, {}> {
  @observable editingState?: EditingState;

  @action beginEditing() {
    const appState = this.props.appState;
    this.props.appState.editingFavorites = true;
    this.editingState = new EditingState(appState.settings);
  }

  async endEditing() {
    this.editingState!.commit();
    this.abortEditing();
  }

  abortEditing() {
    this.editingState = undefined;
    this.props.appState.editingFavorites = false;
  }

  render() {
    const appState = this.props.appState;
    const closestSensor = appState.currentGpsLocation && appState.closestSensorToLocation(appState.currentGpsLocation);

    const isEditing = appState.editingFavorites;

    return <Wrapper>
      <SpriteIcon className="left-icon" icon={isEditing ? Icon.Close : Icon.Edit}
        selected={isEditing}
        onClick={() => isEditing ? this.abortEditing() : this.beginEditing() } />

      {isEditing ?
        <SpriteIcon className="right-icon" icon={Icon.Save}
          onClick={() => this.endEditing() } />
        :
        <SpriteIcon className="right-icon" icon={Icon.Settings}
          onClick={() => appState.showingSettingsPanel = true } />}

      <h1>My Locations</h1>
      <List>
        {closestSensor &&
          <SensorListItem onClick={() => { appState.viewSensor(closestSensor, true); }}>
            <SensorRowSummary sensor={closestSensor} settings={appState.settings} overrideName="Current Location" />
          </SensorListItem>
        }
        <ListItem>
          My Saved Sensors
        </ListItem>
        {appState.settings.favoriteSensors.map((fav) => {
          const sensor = appState.knownSensors.get(fav.sensorId);
          if (!sensor) {
            return null;
          }
          if (isEditing) {
            return (
              <SensorListItem>
                <div style={{ display: 'flex' }}>
                  <FaceIcon size="3rem" pm={sensor.currentPm} />
                  <input style={{ flexGrow: 1, margin: '0 1rem', fontSize: 'larger', padding: '0.5rem' }}
                    placeholder={fav.name}
                    maxLength={appState.settings.MAX_FAVORITE_NAME_LENGTH}
                    onChange={(e) => this.editingState!.rename(sensor, e.currentTarget.value )} />
                  <SpriteIcon icon={Icon.Menu} />
                </div>
              </SensorListItem>
            );
          } else {
            return (
              <SensorListItem
                  onClick={() => { appState.viewSensor(sensor, true); }}>
                <SensorRowSummary sensor={sensor} settings={appState.settings} />
              </SensorListItem>
            );
          }
        }).filter(el => !!el)}
        {appState.settings.favoriteSensors.length === 0 &&
          <EmptyListItem>
            No Saved Locations
          </EmptyListItem>
        }
      </List>
    </Wrapper>;
  }
};


const Wrapper = styled.div`
  flex-grow: 1;
  color: ${themed.chromeText};
  background: ${themed.chromeEmptyBackground};

  & .right-icon {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 1;
  }

  & .left-icon {
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    z-index: 1;
  }

  & h1 {
    font-size: 1.5rem;
    text-align: center;
    background: ${themed.chromeBackground};

    height: 4rem;
    line-height: 4rem;

    /* all for the shadow */
    position: relative;
    margin-left: -1rem;
    padding-left: 2rem;
    margin-right: -1rem;
    padding-right: 2rem;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

