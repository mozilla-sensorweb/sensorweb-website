const { default: styled, ThemeProvider } = require<any>('styled-components');
import * as React from 'react';
import { Sensor } from '../state';
import Sidebar from './Sidebar';
import Location from '../state/Location';

interface SensorDetailsPanelProps {
  sensor: Sensor;
  currentLocation?: Location;
  onClose: Function;
}

const TRANSITION_TIME_MS = 300;

export default class SensorDetailsPanel extends React.Component<SensorDetailsPanelProps, any> {
  el: HTMLElement;

  componentDidMount() {
    this.el.classList.add('loaded');
  }

  beginClose = () => {
    setTimeout(() => {
      this.props.onClose();
    }, TRANSITION_TIME_MS);
    this.el.classList.add('closing');
  }

  render() {
    return <DetailsPanelDiv innerRef={(el: any) => this.el = el}>
      <div onClick={this.beginClose} style={{display: 'flex'}}>
        <img className="close-button" src={require<string>('../assets/back-icon.svg')} />
        <h1 style={{flexGrow: 1, alignSelf: 'center'}}>My Sensor</h1>
      </div>
     <Sidebar
      selectedSensor={this.props.sensor}
      currentLocation={this.props.currentLocation} />
    </DetailsPanelDiv>;
  }
};

    // <div className="value">{pm}</div>
    // <div className="label">µg/m³<br />PM2.5</div>
    // <div className="text">Air Quality is {pmToQualityString(pm)}!</div>
const DetailsPanelDiv = styled.div`
  background: white;
  color: black;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  transform: translateX(110vw);
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.4);

  &.loaded {
    transform: translateX(0);
    transition: transform ${TRANSITION_TIME_MS}ms ease-out;
  }

  &.closing {
    transform: translateX(110vh);
    transition: transform ${TRANSITION_TIME_MS}ms ease-out;
  }


  & h1 {
    font-size: 1.5rem;
  }

  & .close-button {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }
`;