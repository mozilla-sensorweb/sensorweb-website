import * as React from 'react';
import { fetchJsonP } from '../utils';
import styled, { css } from 'styled-components';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import './weatherIcons';

class WeatherManager {

}
interface OpenWeatherMapJson {
  coord: { lat: number, lon: number };
  weather: Array<{ id: number, main: string, description: string, icon: string }>;
  base: string;
  main: {
    temp: number; // kelvin
    pressure: number;
    humidity: number; // 0-100
    temp_min: number;
    temp_max: number;
    sea_level: number;
    grnd_level: number;
  };
  wind: { speed: number, deg: number };
  clouds: { all: number };
  dt: number;
  sys: { message: number; country: string; sunrise: number; sunset: number };
  id: number;
  name: string;
  cod: number;
}

// TODO: Throttle/cache weather!

type Loc = { latitude: number, longitude: number };

async function fetchWeather(location: Loc): Promise<OpenWeatherMapJson> {
  const url = `http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=172c63f7cadd6363539161affd0513d8&callback=?`;
  return await fetchJsonP<OpenWeatherMapJson>(url);
}

interface WeatherSummaryProps {
  expanded?: boolean;
  location: Loc;
  units: 'metric' | 'imperial';
};


function displayTemp(celsius: number | undefined, unit: 'metric' | 'imperial') {
  const value = (unit === 'metric' ? celsius : celsius * 1.8 + 32);
  return `${value && value.toFixed ? value.toFixed() : '--'}°${unit === 'metric' ? 'C' : 'F'}`;
}

@observer
export class WeatherSummary extends React.Component<WeatherSummaryProps, {}> {
  @observable weather?: OpenWeatherMapJson;

  componentDidMount() {
    this.load(this.props.location);
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: WeatherSummaryProps) {
    if (nextProps.location.latitude !== this.props.location.latitude ||
        nextProps.location.longitude !== this.props.location.longitude) {
      this.load(nextProps.location);
    }
  }

  async load(location: Loc) {
    this.weather = await fetchWeather(location);
  }

  render() {
    let iconClassName = 'wi wi-na';
    let conditions = '';
    let temp = displayTemp(undefined, this.props.units);
    let humidity = '--';
    if (this.weather && this.weather.weather[0]) {
      const w = this.weather.weather[0];
      iconClassName = 'wi wi-owm-' + w.id;
      conditions = w.main;
      temp = displayTemp(this.weather.main.temp - 273.15, this.props.units);
      humidity = this.weather.main.humidity.toFixed() + '%';
    }
    return (
      <WeatherSummaryDiv>
        <div data-morph-key="WeatherSummary" style={{display: 'flex', alignItems: 'center'}}>
          <i className={iconClassName}
            alt={conditions}
            title={conditions} />
          <div>
            <div className="temp">
              {temp}
            </div>
            <div style={{whiteSpace: 'nowrap'}}>
              {humidity}
              <img src={require<string>('../assets/humidity-icon.svg')}
                style={{width: '1em', height: '1em', position: 'relative', top: '2px'}} />
            </div>
          </div>
        </div>
        {this.props.expanded && <div style={{marginTop: '1rem'}}>{conditions}</div>}
      </WeatherSummaryDiv>
    );
  }
}

const WeatherSummaryDiv = styled.div`
  align-self: stretch;
  flex-grow: 2;

  & i {
    width: 3rem;
    height: 3rem;
    font-size: 3rem;
    margin-right: 0.5rem;
  }

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #ddd;
  padding-left: 1rem;
  ${(props: any) => props.expanded && css`
    padding-top: 1rem;
    padding-bottom: 1rem;
  `}
`;



