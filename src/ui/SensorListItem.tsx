import React from 'react';

import { Sensor } from '../state';
import { pmToColor } from '../ui/colorScale';
const { default: styled } = require<any>('styled-components');
import { observer, inject } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import Settings from '../state/Settings';
import { fetchJson, fetchJsonP } from '../utils';
import { observable } from 'mobx';

interface SensorListItemProps {
  sensor: Sensor;
  onClickExpand: any;
  onClickDetails: any;
  onClickFavorite: any;
  expanded: boolean;
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

const SensorNameAndQualitySummary = styled(({ sensor }: any) => {
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

  return (
    <div style={{display: 'flex'}}>
      <img className="icon"
        src={faceIcon}
        style={{ backgroundColor: color, borderRadius: '5px' }} />
      <div>
        <div className="sensorName">A Sensor</div>
        <div className="qualityText" style={{color: color}}>{qualityText}</div>
      </div>
    </div>
  );
})`
  display: flex;

  & .sensorName {
    font-size: 1.3rem;
  }

  & .qualityText {
    text-transform: uppercase;
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

@inject('settings')
@observer
export default class SensorListItem extends React.Component<SensorListItemProps & { settings?: Settings }, any> {
  @observable weatherJson?: any;

  async componentDidMount() {
    const { latitude, longitude } = this.props.sensor.location;
    //const url = `https://api.darksky.net/forecast/ef9d0582dae0cc7e34783d8b70f37dfb/${latitude},${longitude}`;
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=172c63f7cadd6363539161affd0513d8&callback=?`;
    this.weatherJson = (await fetchJsonP<any>(url));
  }

  render() {
    const sensor = this.props.sensor;
    const color = pmToColor(sensor.currentPm, 'light');
    let temp = sensor.currentTemperature;
    let humidity = sensor.currentHumidity;
    const isFavorited = this.props.settings!.isFavoriteSensor(sensor);

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

    return <SensorListItemDiv onClick={this.props.onClickExpand}>
      <div className="row">
        <SensorNameAndQualitySummary sensor={sensor} />
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', borderLeft: '1px solid #ddd', paddingLeft: '0.5rem' }}>
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
      {this.props.expanded && <div className="row" style={{marginTop: '0.5rem'}}>
        <img className="ss-icon" src={require<string>('../assets/share-icon.svg')} />
        <img className={'ss-icon' + (isFavorited ? ' favorited' : '')} src={require<string>('../assets/star-icon.svg')}
          onClick={() => {
            if (isFavorited) {
              this.props.settings!.unfavoriteSensor(sensor);
            } else {
              this.props.onClickFavorite(sensor);
            }
          }} />
        <a className="details-link" style={{marginLeft: 'auto'}}
          onClick={this.props.onClickDetails}>Sensor Details ></a>
      </div>}
    </SensorListItemDiv>;
  }
}

const SensorListItemDiv = styled.div`
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

  & .favorited {
    background: goldenrod;
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