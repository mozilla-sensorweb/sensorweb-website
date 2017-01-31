import React from 'react';

import { Sensor, Location } from '../state';
import { pmToColor } from '../ui/colorScale';
const { default: styled, injectGlobal, css } = require<any>('styled-components');
import { observer, inject } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import Settings from '../state/Settings';
import { fetchJson, fetchJsonP } from '../utils';
import { observable, action } from 'mobx';
import { Motion, spring } from 'react-motion';
import { themed } from './theme';
import { WeatherSummary } from './weather';

import moment from 'moment';

interface DetailsDrawerProps {
  sensor?: Sensor;
  onClickExpand: any;
  onClickDetails: any;
  onClickFavorite: any;
  onClickUnfavorite: any;
  settings: Settings;
  currentGpsLocation?: Location;
}

import { MorphTween } from './Morph';


const FormattedTemperature = inject('settings')(observer((props: { value: any, settings: Settings }) => {
  const unit = props.settings.units;
  let value = props.value;
  if (unit === 'imperial') {
    value = value * 1.8 + 32;
  }

  return <span>{value && value.toFixed ? value.toFixed() : '--'}°{unit === 'metric' ? 'C' : 'F'}</span>
}));

/**
 * A row in a list showing the details for a given sensor in brief.
 */

const FaceIcon = ({ pm, size }: { size: string, pm?: number }) => (
  <img
    data-morph-key="FaceIcon"
    className="icon"
    src={pm === undefined ? require<string>('../assets/face-unknown.svg') :
         pm < 36 ? require<string>('../assets/face-great.svg') :
         pm < 59 ? require<string>('../assets/face-moderate.svg') :
         require<string>('../assets/face-bad.svg')}
    style={{
      width: size,
      height: size,
      backgroundColor: pmToColor(pm),
      borderRadius: '5px' }} />
)


const QualityText = styled(({ sensor, style, className }: { sensor: Sensor, style?: any, className: string }) => {
  let pm = sensor.currentPm;

  return <div
    className={className}
    style={{...style, color: pmToColor(pm)}}><span data-morph-key="QualityText">{
      pm === undefined ?
        (sensor.latestReading ? 'No Data for ' + moment(sensor.latestReading.date).fromNow(true) : 'No Data') :
      pm < 36 ? 'Great Air Quality' :
      pm < 59 ? 'Moderate Quality' :
      'Bad Air Quality'
    }
  </span></div>;
})`
  text-transform: uppercase;
`;


@observer
export default class DetailsDrawer extends React.Component<DetailsDrawerProps, any> {
  el: HTMLElement;

  @observable isPressed: boolean = false;
  @observable currentTop: number = 0;
  @observable startTop: number = 0;
  @observable snapTop: number = 0;
  @observable minTop: number = 30;
  @observable maxTop: number = 0;
  @observable previousPageY: number = 0;
  @observable startPageY: number;
  @observable enableSpring: boolean = false;

  async componentDidMount() {
    this.el.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);
    this.el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    this.el.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    this.el.removeEventListener('mousedown', this.onMouseDown as EventListener);
    window.removeEventListener('mousemove', this.onMouseMove as EventListener);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onTouchStart = (e: TouchEvent) => {
    this.onMouseDown(e.touches[0]);
  }

  onMouseDown = (e: { pageY: number } | MouseEvent) => {
    (e instanceof MouseEvent) && e.preventDefault();
    this.startPageY = this.previousPageY = e.pageY;
    this.startTop = this.currentTop = this.el.getBoundingClientRect().top;
    console.log('el', this.el.getBoundingClientRect(), this.el)
    this.isPressed = true;
    this.enableSpring = true;
  }

  onTouchEnd = () => {
    this.onMouseUp();
  }

  onTouchMove = (e: TouchEvent) => {
    if (this.isPressed) {
      e.preventDefault();
      this.onMouseMove(e.touches[0]);
    }
  }

  onSpringRest = () => {
    console.log('onspringrest', this.isPressed)
    if (!this.isPressed) {
      this.enableSpring = false;
    }
  }

  percentTop(current: number) {
   // Because springs move slowly at the end of their life, we end up waiting
   // unnecessarily long for the element to completely come to rest. In practice,
   // we want the user to be able to tap things as soon as the element is perceptibly there.
   current = Math.round(current);

   const range = (this.maxTop - this.minTop);
   const value = (current - this.minTop);
   const percent = value / range;
   return percent;
  }

  onResize = action(() => {
    if (!window.innerHeight) {
      return;
    }
    const newMax = window.innerHeight - 195;
    if (!this.maxTop) {
      this.currentTop = this.snapTop = newMax;
    }
    if (this.snapTop > this.minTop) {
      this.snapTop = newMax;
    }
    this.maxTop = newMax;
    this.currentTop = this.snapTop;
  })

  onMouseMove = (e: { pageY: number } | MouseEvent) => {
    if (this.isPressed) {
      (e instanceof MouseEvent) && e.preventDefault();

      const delta = e.pageY - this.startPageY;
      const immediateDelta = e.pageY - this.previousPageY;
      this.previousPageY = e.pageY;
      this.currentTop = Math.max(this.minTop, Math.min(this.maxTop, this.startTop + delta));

      const wasOpen = this.percentTop(this.currentTop) < 0.5;
      if (Math.abs(delta) < 10 || !immediateDelta) {
        // If the total delta was very small, toggle it.
        //this.snapTop = wasOpen ? this.maxTop : 0;
      } else {
        // Otherwise, take the direction from our immediate velocity.
        this.snapTop = immediateDelta > 0 ? this.maxTop : this.minTop;
      }
    }
  }

  onMouseUp = () => {
    if (this.startPageY === this.previousPageY) {
      // we didn't move, toggle it
      const wasOpen = this.percentTop(this.currentTop) < 0.5;
      //this.snapTop = wasOpen ? this.maxTop : 0;
    }
    this.isPressed = false;
  }

  onClickFavorite = () => {
    const sensor = this.props.sensor;
    if (!sensor) {
      return;
    }
    const isFavorited = sensor && this.props.settings!.getFavoriteSensor(sensor);

    if (isFavorited) {
      this.props.onClickUnfavorite(sensor);
    } else {
      this.props.onClickFavorite(sensor);
    }
  }

  render() {
    const sensor = this.props.sensor;
    const favorite = sensor && this.props.settings!.getFavoriteSensor(sensor);
    console.log('render', 'max', this.maxTop, 'cur',this.currentTop, 'snap',this.snapTop);

    let displayDistance = '';
    if (this.props.currentGpsLocation && sensor) {
      const km = sensor.location.distanceTo(this.props.currentGpsLocation);
      if (this.props.settings!.units === 'metric') {
        displayDistance = km.toFixed(0) + ' km';
      } else {
        let miles = (km * 0.62137).toFixed(0);
        displayDistance = miles + (miles === '1' ? ' mile' : ' miles');
      }
    }

    let isStale = sensor && sensor.latestReading && sensor.latestReading.date.getTime() < (Date.now() - 1000*60*60);
    let age = '';
    if (sensor && sensor.latestReading) {
      age = moment(sensor && sensor.latestReading.date).fromNow();
    }

    return (
      <Motion
        onRest={this.onSpringRest}
        style={{ y: (!this.isPressed && this.enableSpring) ? spring(this.snapTop) : this.currentTop }}>{({ y }: any) => (
        <DetailsDrawerDiv
          style={{ opacity: this.maxTop && sensor ? 1 : 0, transform: `translateY(${y}px)` }}
          innerRef={(el: HTMLElement) => this.el = el} /*onClick={this.props.onClickExpand}*/>
          <Gripper />
          {sensor && <MorphTween percent={1 - this.percentTop(y)}>
            <Flex column>
              <Flex row valign="center">
                <FaceIcon size="3rem" pm={sensor.currentPm} />
                <Flex column grow={3} style={{ marginLeft: '1rem' }}>
                  <div><span data-morph-key="favname" style={{fontSize: '1.3rem'}}>{favorite && favorite.name || 'Sensor'}</span></div>
                  <QualityText sensor={sensor} />
                </Flex>
                <WeatherSummary units={this.props.settings.units} location={sensor.location} />
              </Flex>
              <Flex row valign="center" style={{marginTop: '0.5rem'}}>
                <FavoriteIcon isFavorited={!!favorite} onClick={this.onClickFavorite}>Save</FavoriteIcon>
                <ShareIcon>Share</ShareIcon>
                <div style={{marginLeft: 'auto'}}>
                  <div>{displayDistance} from your location</div>
                  <div style={{color: isStale ? '#900' : '#999'}}>Updated {age}.</div>
                </div>
              </Flex>
            </Flex>

            <Flex column style={{padding: '0.5rem'}}>
              <div>
                <img style={{width: '4rem', height: '3rem', verticalAlign: '-70%', paddingRight: '1rem'}} src={require<string>('../assets/collapse-icon.svg')} />
                <span data-morph-key="favname" style={{fontSize: '1.5rem'}}>{favorite && favorite.name || 'Sensor'}</span>
              </div>
              <Flex row valign="center" style={{marginBottom: '1rem'}}>
                <Flex column valign="center" grow={3}>
                  <Flex row style={{marginTop: '1rem'}}>
                    <FaceIcon size="5rem" pm={sensor.currentPm} />
                    <div style={{marginLeft: '1rem', textAlign: 'center'}}>
                      <span style={{ fontSize: '4rem', lineHeight: '4rem' }}>{sensor.currentPm}</span><br />PM2.5</div>
                  </Flex>
                  <QualityText style={{marginTop: '1rem'}} sensor={sensor} />
                </Flex>
                <WeatherSummary expanded units={this.props.settings.units} location={sensor.location} />
              </Flex>
              <Flex column>
                <Flex row valign="center">
                  <FavoriteIcon expanded isFavorited={!!favorite} onClick={this.onClickFavorite}>Save</FavoriteIcon>
                  <ShareIcon expanded>Share</ShareIcon>
                </Flex>
                <div style={{marginTop: '1rem', fontSize: 'smaller'}}>
                  <div>
                    {displayDistance} from your location
                  </div>
                  <div style={{color: isStale ? '#900' : '#999'}}>Updated {age}.</div>
                  <div>
                    Source: Mozilla Products
                  </div>
                </div>
              </Flex>
            </Flex>
          </MorphTween>}
        </DetailsDrawerDiv>
      )}</Motion>
    );
  }
}

const Flex = (props: any) => {
  let style: React.CSSProperties = { display: 'flex' };
  props.row && (style.flexDirection = 'row');
  props.column && (style.flexDirection = 'column');
  if (props.row) {
    props.valign && (style.alignItems = props.valign);
    props.halign && (style.justifyContent = props.halign);
  }
  if (props.column) {
    props.valign && (style.justifyContent = props.valign);
    props.halign && (style.alignItems = props.halign);
  }
  props.grow && (style.flexGrow = props.grow || '1');
  props.shrink && (style.flexShrink = props.shrink);
  // props.justify && (style.justifyContent = props.justify);
  // props.align && (style.alignContent = props.align);
  return <div style={{...style, ...props.style}}>{props.children}</div>
};


const iconCss = css`
  display: flex;
  align-items: center;
  border: 2px solid #eee;
  border-radius: 6px;
  margin-right: 0.5rem;
  &:last-child { margin-right: 0 }
  overflow: hidden;

  &:hover {
    background: ${themed.chromeHoverBackground};
  }
  &:active {
    background: ${themed.chromeActiveBackground};
  }

  & > img {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }
  & > span {
    display: none;
    padding: 0.5rem;
  }
  ${(props: any) => props.expanded && css`
    & > span {
      display: block;
    }
    flex-grow: 1;
    justify-content: center;

  `}
`


export const SensorRowSummary = (props: { sensor: Sensor, settings: Settings }) => {
  const sensor = props.sensor;
  const favorite = props.settings!.getFavoriteSensor(sensor);
  return <Flex row valign="center">
    <FaceIcon size="3rem" pm={sensor.currentPm} />
    <Flex column grow={3} style={{ marginLeft: '1rem' }}>
      <div><span data-morph-key="favname" style={{fontSize: '1.3rem'}}>{favorite && favorite.name || 'Sensor'}</span></div>
      <QualityText sensor={sensor} />
    </Flex>
    {/*<WeatherSummary icon={iconUrl} temp={temp} humidity={humidity} summary={summary} />*/}
  </Flex>;
}

const ShareIcon = styled((props: any) => (
  <div data-morph-key="share" className={props.className}>
    <img data-morph-key="share-icon" src={require<string>('../assets/share-icon.svg')} />
    <span>{props.children}</span>
  </div>
))`
  ${iconCss}
`;

const FavoriteIcon = styled((props: any) => (
  <div data-morph-key="favorite" className={props.className} onClick={props.onClick}>
    <img data-morph-key="favorite-icon" src={props.isFavorited ? require<string>('../assets/star-icon-on.svg') : require<string>('../assets/star-icon.svg')} />
    <span>{props.children}</span>
  </div>
))`
  ${iconCss}
`;

const Gripper = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  height: 40px;
  top: -40px;

  background: url(${require<string>('../assets/gripper.png')}) no-repeat bottom center / 512px 40px;

  z-index: 1;
`

const DetailsDrawerDiv = styled.div`
  background: rgb(255, 255, 255);
  color: black;
  padding: 0.5rem;
  padding-bottom: 0;
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  height: 100vh;
  z-index: 2000;
  transition: opacity 200ms ease;

  display: flex;
  flex-direction: column;


`;