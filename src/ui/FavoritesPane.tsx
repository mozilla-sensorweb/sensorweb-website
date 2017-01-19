import * as React from 'react';
const { default: styled } = require<any>('styled-components');
import { SensorRowSummary } from './SensorListItem';
import { AppState } from '../state';

interface FavoritesPaneProps {
  appState: AppState;
}

export default class FavoritesPane extends React.Component<FavoritesPaneProps, {}> {
  render() {
    const appState = this.props.appState;
    return <Wrapper>
      <img
        className="settings"
        onClick={() => appState.showingSettingsPanel = true }
        src={require<string>('../assets/settings-icon.svg')} />
      <h1>Favorites</h1>
      <ul>
        {appState.settings.favoriteSensors.map((fav) => {
          const sensor = appState.knownSensors.get(fav.sensorId);
          if (!sensor) {
            return null;
          }
          return (
            <FavoriteListItem
                onClick={() => { appState.viewSensor(sensor, true); }}>
              <SensorRowSummary sensor={sensor} name={fav.name}/>
            </FavoriteListItem>
          );
        }).filter(el => !!el)}
      </ul>
    </Wrapper>;
  }
};


const Wrapper = styled.div`
  flex-grow: 1;
  color: black;
  background: #eee;

  & .settings {
    width: 3rem;
    height: 3rem;
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 1;
  }

  & h1 {
    font-size: 1.5rem;
    background: #fff;
    text-align: center;

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


const FavoriteListItem = styled.li`
  list-style: none;
  cursor: pointer;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
  background: white;
`;
