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
import * as _ from 'lodash';

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
  @observable newOrder?: number[];
  constructor(public settings: Settings) {

  }

  rename(sensor: Sensor, newName: string) {
    this.newSensorNames.set(sensor, newName);
  }

  setOrder(newOrder: number[]) {
    this.newOrder = newOrder;
  }

  commit() {
    this.newSensorNames.forEach((name, sensor) => {
      let fav = this.settings.getFavoriteSensor(sensor)!;
      console.log('commit', name, sensor)
      if (name) {
        fav.name = name;
      }
    });
    if (this.newOrder) {
      let newFavs: FavoriteSensor[] = [];
      this.settings.favoriteSensors.forEach((fav, index) => {
        newFavs[this.newOrder!.indexOf(index)] = fav;
      });
      this.settings.favoriteSensors = newFavs;
    }
  }
}


import { Motion, spring } from 'react-motion';
import { range } from 'lodash';

function reinsert<T>(arr: T[], from: number, to: number) {
  const _arr = arr.slice();
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(Math.min(n, max), min);
}


interface ReorderableListProps {
  onOrderChanged(newOrder: number[]): void;
  children?: any;
  gripperSelector: string;
  reorderable: boolean;
}

@observer
class ReorderableList extends React.Component<ReorderableListProps, {}> {
  @observable topDeltaY = 0;
  @observable mouseY = 0;
  @observable isPressed = false;
  @observable originalPosOfLastPressed = 0;
  @observable order?: number[];
  el: HTMLElement;
  @observable itemHeight = 0;
  @observable changedThisPress = false;
  @observable favorites: FavoriteSensor[];

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUpdate(nextProps: ReorderableListProps) {
    const newChildren = React.Children.toArray(nextProps.children) as React.ReactElement<any>[];
    const oldChildren = React.Children.toArray(this.props.children) as React.ReactElement<any>[];
    if (!_.isEqual(oldChildren.map(c => c.key), newChildren.map(c => c.key))) {
      this.order = undefined;
    }
  }

  componentDidUpdate() {
    if (this.el.children[0] && !this.isPressed) {
      this.itemHeight = (this.el.children[0] as HTMLElement).offsetHeight;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  @action handleTouchStart = (key: number, pressLocation: number, e: TouchEvent) => {
    this.handleMouseDown(key, pressLocation, e.touches[0], e);
  }

  @action handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  }

  @action handleMouseDown = (pos: number, pressY: number, { pageY }: any, e: MouseEvent | TouchEvent) => {
    if (!this.props.reorderable) {
      return;
    }
    if (!(e.target as HTMLElement).matches(this.props.gripperSelector)) {
      return;
    }
    this.topDeltaY = pageY - pressY;
    this.mouseY = pressY;
    this.isPressed = true;
    this.originalPosOfLastPressed = pos;
  }

  @action handleMouseMove = ({ pageY }: any) => {
    const itemsCount = React.Children.count(this.props.children);

    if (this.isPressed) {
      this.mouseY = pageY - this.topDeltaY;
      const currentRow = clamp(Math.round(this.mouseY / this.itemHeight), 0, itemsCount - 1);
      if (!this.order) {
        this.order = range(React.Children.count(this.props.children));
      }
      const newOrder = reinsert(this.order, this.order.indexOf(this.originalPosOfLastPressed), currentRow);
      if (!_.isEqual(newOrder, this.order)) {
        this.order = newOrder;
        this.changedThisPress = true;
      }
    }
  }

  @action handleMouseUp = (e: Event) => {
    if (this.changedThisPress) {
      this.changedThisPress = false;
      this.props.onOrderChanged(this.order!);
    }
    this.isPressed = false;
    this.topDeltaY = 0;
  }


  getChildOffset(index: number) {
    if (!this.order) {
      return index * this.itemHeight;
    } else {
      return this.order.indexOf(index) * this.itemHeight;
    }
  }

  render() {
    const springConfig = { stiffness: 300, damping: 50 };
    const children = React.Children.toArray(this.props.children);
    //console.log('RENDER', this.order);

    return (
      <div ref={el => this.el = el} style={{ height: (this.itemHeight * children.length) + 'px'}}>
        {range(children.length).map(i => {
          const style = this.originalPosOfLastPressed === i && this.isPressed
            ? {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: this.mouseY,
              }
            : {
                scale: spring(1, springConfig),
                shadow: spring(0, springConfig),
                y: this.props.reorderable ? spring(this.getChildOffset(i), springConfig) : this.getChildOffset(i),
              };
          return (
            <Motion style={style} key={(children[i] as React.ReactElement<any>).key!}>
              {({scale, shadow, y}: any) =>
                <div
                  onMouseDown={(e) => this.handleMouseDown(i, y, e, e as any) }
                  onTouchStart={(e) => this.handleTouchStart(i, y, e as any)}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: i === this.originalPosOfLastPressed ? 99 : i,
                  }}>
                  {/*children[this.order.indexOf(i)]*/}
                  {children[i]}
                </div>
              }
            </Motion>
          );
        })}
      </div>
    );
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

    const favorites = appState.settings.favoriteSensors;

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
        <ListItem style={{fontSize: 'larger', background: '#f5f5f5'}}>
          My Saved Sensors
        </ListItem>
        <ReorderableList
          reorderable={isEditing}
          gripperSelector=".reorder"
          onOrderChanged={(newOrder) => this.editingState!.setOrder(newOrder) }>
        {favorites.map((fav) => {
          const sensor = appState.knownSensors.get(fav.sensorId);
          if (!sensor) {
            return null;
          }
          if (isEditing) {
            return (
              <SensorListItem key={sensor.id}>
                <div style={{ display: 'flex' }}>
                  <FaceIcon size="3rem" pm={sensor.currentPm} />
                  <input style={{ flexGrow: 1, margin: '0 1rem', fontSize: 'larger', padding: '0.5rem' }}
                    placeholder={fav.name}
                    defaultValue={fav.name}
                    maxLength={appState.settings.MAX_FAVORITE_NAME_LENGTH}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => this.editingState!.rename(sensor, e.currentTarget.value )} />
                  <SpriteIcon className="reorder" icon={Icon.Menu} />
                </div>
              </SensorListItem>
            );
          } else {
            return (
              <SensorListItem key={sensor.id}
                  onClick={() => { appState.viewSensor(sensor, true); }}>
                <SensorRowSummary sensor={sensor} settings={appState.settings} />
              </SensorListItem>
            );
          }
        }).filter(el => !!el)}
        </ReorderableList>
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

