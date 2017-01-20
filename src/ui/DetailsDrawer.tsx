import React from 'react';

import { Sensor, Location } from '../state';
import { pmToColor } from '../ui/colorScale';
const { default: styled, injectGlobal } = require<any>('styled-components');
import { observer, inject } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import Settings from '../state/Settings';
import { fetchJson, fetchJsonP } from '../utils';
import { observable, action } from 'mobx';
import { Motion, spring } from 'react-motion';

interface DetailsDrawerProps {
  sensor?: Sensor;
  onClickExpand: any;
  onClickDetails: any;
  onClickFavorite: any;
  settings: Settings;
  currentGpsLocation?: Location;
}


const FormattedTemperature = inject('settings')(observer((props: { value: any, settings: Settings }) => {
  const unit = props.settings.temperatureUnits;
  let value = props.value;
  if (unit === 'f') {
    value = value * 1.8 + 32;
  }

  return <span>{value && value.toFixed ? value.toFixed() : '--'}°{unit === 'c' ? 'C' : 'F'}</span>
}));

/**
 * A row in a list showing the details for a given sensor in brief.
 */

export const SensorRowSummary = styled(({ className, sensor, name }: any) => {
  const color = pmToColor(sensor.currentPm, 'light');

  let faceIcon;
  let qualityText;
  if (sensor.currentPm < 36) {
    faceIcon = require<string>('../assets/face-great.svg');
    qualityText = 'Great Air Quality';
  } else if (sensor.currentPm < 59) {
    faceIcon = require<string>('../assets/face-moderate.svg');
    qualityText = 'Moderate Quality';
  } else {
    faceIcon = require<string>('../assets/face-bad.svg');
    qualityText = 'Bad Air Quality';
  }

  let temp = sensor.currentTemperature;
  let humidity = sensor.currentHumidity;
  let iconUrl = weatherIcons['unknown'];
  let summary = 'unknown';
  if (this.weatherJson && this.weatherJson.weather && this.weatherJson.weather[0]) {
    iconUrl = `http://openweathermap.org/img/w/${this.weatherJson.weather[0].icon}.png`;
    // if ((weatherIcons as any)[this.weatherJson.weather[0].icon]) {
    //   iconUrl = (weatherIcons as any)[this.weatherJson.weather[0].icon];
    // }
    if (!temp) {
      temp = this.weatherJson.main.temp - 273.15;
    }
    if (!humidity) {
      humidity = this.weatherJson.main.humidity;
    }
    summary = this.weatherJson.weather[0].summary;
  }

  return (
    <div className={className}>
      <img className="icon"
        src={faceIcon}
        style={{ backgroundColor: color, borderRadius: '5px' }} />
      <div>
        <div className="sensorName">{name || 'Sensor'}</div>
        <div className="qualityText" style={{color: color}}>{qualityText}</div>
      </div>
      <div style={{marginLeft: 'auto', flexBasis: '7rem', display: 'flex', alignItems: 'center', borderLeft: '1px solid #ddd', paddingLeft: '0.5rem' }}>
        <img
          src={iconUrl}
          alt={summary}
          title={summary}
          style={{width: '3rem', height: '3rem'}} />
        <div>
          <div className="temp"><FormattedTemperature value={temp} /></div>
          <div style={{whiteSpace: 'nowrap'}}>
            <img src={require<string>('../assets/humidity-icon.svg')} style={{width: '1em', height: '1em', position: 'relative', top: '2px'}} />
            {humidity && humidity.toFixed() || '--'}<span className="unit">%</span>
            </div>
        </div>
      </div>
    </div>
  );
})`
  display: flex;
  flex-grow: 1;

  & .sensorName {
    font-size: 1.3rem;
  }

  & .qualityText {
    text-transform: uppercase;
  }

  & .icon {
    width: 3rem;
    height: 3rem;
    margin-right: 0.5rem;
  }
`;


const weatherIcons = {
  'clear-day': require<string>('../assets/weather-icons/clear-day.svg'),
  'clear-night': require<string>('../assets/weather-icons/clear-night.svg'),
  'rain': require<string>('../assets/weather-icons/rain.svg'),
  'snow': require<string>('../assets/weather-icons/snow.svg'),
  'sleet': require<string>('../assets/weather-icons/sleet.svg'),
  'wind': require<string>('../assets/weather-icons/wind.svg'),
  'fog': require<string>('../assets/weather-icons/fog.svg'),
  'cloudy': require<string>('../assets/weather-icons/cloudy.svg'),
  'unknown': require<string>('../assets/weather-icons/unknown.svg'),
  'partly-cloudy-day': require<string>('../assets/weather-icons/partly-cloudy-day.svg'),
  'partly-cloudy-night': require<string>('../assets/weather-icons/partly-cloudy-night.svg'),
};

@observer
export default class DetailsDrawer extends React.Component<DetailsDrawerProps, any> {
  @observable weatherJson?: any;
  el: HTMLElement;

  @observable isPressed: boolean = false;
  @observable currentTop: number = 0;
  @observable startTop: number = 0;
  @observable snapTop: number = 0;
  @observable maxTop: number = 0;
  @observable previousPageY: number = 0;
  @observable startPageY: number;
  @observable enableSpring: boolean = false;

  async componentDidMount() {
    this.el.removeEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);
    this.el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onResize);
    this.onResize();
    if (this.props.sensor) {
      this.onNewSensorShown(this.props.sensor);
    }
  }

  conponentWillReceiveProps(nextProps: DetailsDrawerProps) {
    if (nextProps.sensor) {
      this.onNewSensorShown(nextProps.sensor);
    }
  }

  async onNewSensorShown(sensor: Sensor) {
    const { latitude, longitude } = sensor.location;
    //const url = `https://api.darksky.net/forecast/ef9d0582dae0cc7e34783d8b70f37dfb/${latitude},${longitude}`;
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=172c63f7cadd6363539161affd0513d8&callback=?`;
    this.weatherJson = (await fetchJsonP<any>(url));
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
    this.startPageY = this.previousPageY = e.pageY;
    this.startTop = this.currentTop = this.el.getBoundingClientRect().top;
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

  onResize = action(() => {
    if (!window.innerHeight) {
      return;
    }
    const newMax = window.innerHeight - 175;
    if (!this.maxTop) {
      this.currentTop = this.snapTop = newMax;
    }
    if (this.snapTop > 0) {
      this.snapTop = newMax;
    }
    this.maxTop = newMax;
    this.currentTop = this.snapTop;
  })

  onMouseMove = (e: { pageY: number } | MouseEvent) => {
    if (this.isPressed) {
      const delta = e.pageY - this.startPageY;
      const immediateDelta = e.pageY - this.previousPageY;
      this.previousPageY = e.pageY;
      this.currentTop = Math.max(0, Math.min(this.maxTop, this.startTop + delta));

      const wasOpen = this.startTop < (this.maxTop / 2);
      if (Math.abs(delta) < 10 || !immediateDelta) {
        // If the total delta was very small, toggle it.
        this.snapTop = wasOpen ? this.maxTop : 0;
      } else {
        // Otherwise, take the direction from our immediate velocity.
        this.snapTop = immediateDelta > 0 ? this.maxTop : 0;
      }
    }
  }

  onMouseUp = () => {
    if (this.startPageY === this.previousPageY) {
      // we didn't move, toggle it
      const wasOpen = this.startTop < (this.maxTop / 2);
      this.snapTop = wasOpen ? this.maxTop : 0;
    }
    this.isPressed = false;
  }

  render() {
    const sensor = this.props.sensor;
    const isFavorited = sensor && this.props.settings!.isFavoriteSensor(sensor);
    console.log('render', 'max', this.maxTop, 'cur',this.currentTop, 'snap',this.snapTop);

    let displayDistance = '';
    if (this.props.currentGpsLocation && sensor) {
      const km = sensor.location.distanceTo(this.props.currentGpsLocation);
      displayDistance = km.toFixed(1) + 'km';
    }

    return (
      <Motion
        onRest={this.onSpringRest}
        style={{ y: (!this.isPressed && this.enableSpring) ? spring(this.snapTop) : this.currentTop }}>{({ y }: any) => (
        <DetailsDrawerDiv
          style={{ opacity: this.maxTop && sensor ? 1 : 0, transform: `translateY(${y}px)` }}
          innerRef={(el: HTMLElement) => this.el = el} onClick={this.props.onClickExpand}>
          <Gripper>
            <span></span>
            <span></span>
            <span></span>
          </Gripper>
          { sensor &&
          <div className="row">
            <SensorRowSummary sensor={sensor} />
          </div> }
          { sensor && <div className="row">
            <img className="ss-icon" src={require<string>('../assets/share-icon.svg')} />
            <img className={'ss-icon' + (isFavorited ? ' favorited' : '')}
              src={isFavorited ? require<string>('../assets/star-icon-on.svg') : require<string>('../assets/star-icon.svg')}
              onClick={() => {
                if (isFavorited) {
                  this.props.settings!.unfavoriteSensor(sensor);
                } else {
                  this.props.onClickFavorite(sensor);
                }
              }} />
            <span style={{marginLeft: 'auto'}}>
              {displayDistance} from your location
            </span>
          </div> }
        </DetailsDrawerDiv>
      )}</Motion>
    );
  }
}

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
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  z-index: 2000;
  transition: opacity 200ms ease;

  display: flex;
  flex-direction: column;

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

  & .favorited {

  }

  & .ss-icon {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }

`;