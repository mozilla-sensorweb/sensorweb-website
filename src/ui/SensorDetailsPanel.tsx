const { default: styled, ThemeProvider } = require<any>('styled-components');
import * as React from 'react';
import { Sensor } from '../state';
import Sidebar from './Sidebar';
import Location from '../state/Location';
import Modal from './Modal';

interface SensorDetailsPanelProps {
  sensor: Sensor;
  currentLocation?: Location;
  onClose(): void;
}

/**
 * The popup that shows the details of an individual sensor, including its graph, etc.
 */
export default class SensorDetailsPanel extends React.Component<SensorDetailsPanelProps, any> {
  render() {
    return (
      <Modal title="My Sensor" onClose={this.props.onClose}>
        <Sidebar
          selectedSensor={this.props.sensor}
          currentLocation={this.props.currentLocation} />
      </Modal>
    );
  }
};

// <div className="value">{pm}</div>
// <div className="label">µg/m³<br />PM2.5</div>
// <div className="text">Air Quality is {pmToQualityString(pm)}!</div>