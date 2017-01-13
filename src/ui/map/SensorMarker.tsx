import * as React from 'react';
import { ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import { pmToColor } from '../colorScale';

import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sensor } from '../../state';

import NumberTween from '../NumberTween';

const { default: styled, keyframes } = require<any>('styled-components');

interface SensorMarkerProps {
  sensor: Sensor;
  onClick: (sensor: Sensor) => void;
  selected: boolean;
}

@observer
export default class SensorMarker extends React.Component<SensorMarkerProps, {}> {
  constructor(props: SensorMarkerProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: SensorMarkerProps) {
    return nextProps.sensor !== this.props.sensor ||
      nextProps.sensor.currentPm !== this.props.sensor.currentPm ||
      nextProps.selected !== this.props.selected;
  }

  render() {
    const pm = this.props.sensor.currentPm || 0;
    let bgColor = d3.hsl(d3.rgb(pmToColor(pm, 'light')));
    let shadowColor = d3.hsl(bgColor);
    shadowColor.opacity = 0.6;

    return <SensorMarkerStyledDiv
      style={{ zIndex: this.props.selected ? 1 : 0 }}
      onClick={(e: any) => this.props.onClick(this.props.sensor)}>
      <MarkerShadow
        selected={this.props.selected}
        style={{backgroundColor: shadowColor}} />
      <MarkerNumberWrapper
        backgroundColor={bgColor}><NumberTween value={pm} />
      </MarkerNumberWrapper>
    </SensorMarkerStyledDiv>;
  }
}


const pulsate = keyframes`
  0% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1.4); opacity: 1; }
`;

const MarkerShadow = styled.div`
  opacity: ${(props: any) => props.selected ? 1 : 0};
  transition: opacity 300ms ease-out, transform 300ms cubic-bezier(0.355, 1.395, 0.605, 0.975);
  transform: scale(${(props: any) => props.selected ? 1 : 0.5});
  animation: ${(props: any) => props.selected ? pulsate + ' 1.5s ease-in-out' : 'none'};
  animation-iteration-count: infinite;
  animation-direction: alternate;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  z-index: -1;
`;

const MarkerNumberWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  background-color: ${(props: any) => props.backgroundColor};
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);

  &::before {
    border: 5px solid white;
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  }
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
`;

const SensorMarkerStyledDiv = styled.div`
  zIndex: ${(props: any) => props.selected ? 1 : 0};
  position: absolute;
  width: 4rem;
  height: 4rem;
  margin-left: -2rem;
  margin-top: -2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;
