import React from 'react';

import { Sensor } from '../state';
import { pmToColor } from '../ui/colorScale';
const { default: styled } = require<any>('styled-components');

interface SensorListItemProps {
  sensor: Sensor;
  onClickExpand: any;
  onClickDetails: any;
  expanded: boolean;
}

/**
 * A row in a list showing the details for a given sensor in brief.
 */
export default class SensorListItem extends React.Component<SensorListItemProps, any> {
  render() {
    const sensor = this.props.sensor;
    const color = pmToColor(sensor.currentPm, 'light');
    const temp = sensor.currentTemperature;
    const humidity = sensor.currentHumidity;

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

    return <SensorListItemDiv onClick={this.props.onClickExpand}>
      <div className="row">
        <img className="icon"
          src={faceIcon}
          style={{ backgroundColor: color, borderRadius: '5px' }} />
        <div>
          <div className="sensorName">A Sensor</div>
          <div className="qualityText" style={{color: color}}>{qualityText}</div>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', borderLeft: '1px solid #ddd', paddingLeft: '0.5rem' }}>
          <img
            src={require<string>('../assets/sun-icon.svg')}
            style={{width: '3rem', height: '3rem'}} />
          <div>
            <div className="temp">{temp && temp.toFixed() || '--'}<span className="unit">°C</span></div>
            <div><img src={require<string>('../assets/humidity-icon.svg')} style={{width: '1em', height: '1em', position: 'relative', top: '2px'}} />
              {humidity && humidity.toFixed() || '--'}<span className="unit">%</span>
              </div>
          </div>
        </div>
      </div>
      {this.props.expanded && <div className="row" style={{marginTop: '0.5rem'}}>
        <img className="ss-icon" src={require<string>('../assets/share-icon.svg')} />
        <img className="ss-icon" src={require<string>('../assets/star-icon.svg')} />
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