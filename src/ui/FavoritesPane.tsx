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

  & h1 {
    font-size: 1.5rem;
    background: #fff;
    text-align: center;
    padding: 1rem;

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
