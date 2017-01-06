import * as React from 'react';
import * as d3 from 'd3';
import * as physics from '../physics';
import moment from 'moment';

import { Motion, spring } from 'react-motion';
import { pmToColor, pmToIndex } from './colorScale';
import { Sensor, Location } from '../state';
import { observer } from 'mobx-react';
import HistoryGraph from './HistoryGraph';

const { default: styled, css } = require<any>('styled-components');

// http://taqm.epa.gov.tw/taqm/tw/fpmi.htm

function pmToQualityString(pm: number) {
  const strs = ['Amazing', 'Great', 'Good', 'Fair', 'Questionable', 'Risky', 'Bad', 'Really Bad', 'Terrible', 'Apocalyptic'];
  return strs[pmToIndex(pm)];
}



const SummaryBox = observer(function ({ sensor, currentLocation }:
  { sensor?: Sensor, currentLocation: Location | undefined }) {

  let displayDistance = null;
  if (currentLocation && sensor) {
    const km = sensor.location.distanceTo(currentLocation);
    displayDistance = km.toFixed(1) + 'km';
  }

  const value = sensor && sensor.currentPm || 0;
  const readingTime = sensor && sensor.latestReading && moment(sensor.latestReading.date).fromNow();
  const color = pmToColor(value, 'light');

  return (
    <Section hidden={!sensor}>
      <SummaryBoxDiv>
        <div className="header">
          <div className="airText"
            style={{ color }}>Air Quality is {pmToQualityString(value)}!</div>
        </div>
        <LeftRightSmallTextList>
          {displayDistance && <li>{displayDistance} from your location</li>}
          <li>{readingTime}</li>
        </LeftRightSmallTextList>
        <div>
          <div className="mainValue">
            <div className="value" style={{ color }}>{value}</div>
            <div className="label">µg/m³<br />PM2.5</div>
          </div>
        </div>
      </SummaryBoxDiv>
    </Section>
  );
});


const SummaryBoxDiv = styled.div`
  display: flex;
  flex-direction: column;

  & .header {
    border-bottom: 1px solid #999;
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
  }

  & .mainValue {
    display: flex;
    align-self: center;
    align-items: flex-end;
    justify-content: center;

    & .value {
      font-size: 6rem;
      font-weight: 200;
      line-height: 1;
    }
    & .label {
      font-weight: 200;
      padding: 0 0 1rem 0.5rem;
    }

  }
`;

const LeftRightSmallTextList = styled.ul`
  font-size: smaller;
  color: #999;
  list-style: none;
  padding-left: 0;
  overflow: hidden;

  & li:first-child {
    float: left;
  }
  & li:last-child {
    float: right;
  }
`;


const Section = styled.div`
  opacity: ${(props: any) => props.hidden ? 0 : 1};
  margin: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  transition: opacity 300ms ease;
`;

let CurrentDetailsItem = styled(({value, label, className}: any) => (
  <div className={className}>
    <div className="value">{value}</div>
    <div className="label">{label}</div>
  </div>
))`
  & .value {
    font-weight: 200;
    font-size: 1.3rem;
    line-height: 1;
  }
  & .label {
    font-size: 0.7rem;
  }
`;

const CurrentDetailsDiv = styled.div`
  display: flex;
  justify-content: space-around;
`;

const CurrentDetails = observer(function ({ sensor }: { sensor?: Sensor }) {
  let displayTemp = '--°';
  let displayHumidity = '--%';
  if (sensor && sensor.currentTemperature !== undefined) {
    const celsius = sensor.currentTemperature;
    displayTemp = Math.round(celsius * 1.8 + 32) + '°F';
  }
  if (sensor && sensor.currentHumidity !== undefined) {
    displayHumidity = Math.round(sensor.currentHumidity) + '%';
  }
  return (
    <Section hidden={!sensor}>
      <CurrentDetailsDiv>
        <CurrentDetailsItem value={displayTemp} label="Temperature" />
        <CurrentDetailsItem value={displayHumidity} label="Humidity" />
        <CurrentDetailsItem value="Cloudy" label="Conditions" />
      </CurrentDetailsDiv>
    </Section>
  );
});


interface SidebarState {
  dragging: boolean;
  y: number;
  minY: number;
  maxY: number;
  magnitude: 0;
  loading: boolean;
}

interface SidebarProps {
  currentLocation?: Location;
  selectedSensor?: Sensor;
}

export default class Sidebar extends React.Component<SidebarProps, SidebarState> {
  el: HTMLElement;
  offset: number;
  draggable: physics.Draggable;
  readonly minimizedHeight = 80;

  constructor(props: {}) {
    super(props);
    this.state = {
      dragging: false,
      y: 1000,
      magnitude: 0,
      minY: 0,
      maxY: 1000,
      loading: true
    };
  }

  componentDidMount() {
    this.draggable = new physics.Draggable(this.el, {
      start: () => {
        this.setState({ dragging: true } as SidebarState);
      },
      update: (delta: physics.Point) => {
        this.setState((prevState) => ({
          magnitude: delta.y,
          y: Math.max(prevState.minY, Math.min(prevState.maxY, prevState.y + delta.y))
        } as SidebarState));
      },
      end: () => {
        this.setState((prevState) => {
          const opened = prevState.magnitude === 0
            ? prevState.y < (prevState.maxY / 2)
            : prevState.magnitude < 0;
          return {
            dragging: false,
            y: opened ? prevState.minY : prevState.maxY
          } as SidebarState;
        });
      }
    });

    window.addEventListener('resize', this.onResize);
    // XXX: flexbox takes time to layout?
    setTimeout(this.onResize, 500);
    // XXX: must set loading=false after already setting and moving y/maxY
    setTimeout(() => {
      this.setState({ loading: false } as SidebarState);
    }, 1000);
  }

  onResize = () => {
    setTimeout(() => {
      console.log('setState in resize');
      const newMaxY = this.el.parentElement!.getBoundingClientRect().height - this.minimizedHeight;
      this.setState((prevState) => ({
        y: prevState.y === 0 ? 0 : newMaxY,
        maxY: newMaxY
      } as SidebarState));
      console.log('done set state');
    }, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    this.draggable.destroy();
  }

  readonly SPRING_PROPS = { stiffness: 300, damping: 24 };

  render() {
    let sensor = this.props.selectedSensor;
    //console.log('render sidebar', !!sensor);

    return <SidebarDiv innerRef={(el: any) => this.el = el}>
        <div style={{background: '#eee',
          backgroundSize: 'cover', display: 'flex', flexDirection: 'column', flex: '0 0 auto'}}>
          <SummaryBox
            currentLocation={this.props.currentLocation}
            sensor={sensor} />
          <CurrentDetails sensor={sensor} />
          <div className="waves">
            <img src={require<string>('../assets/sidebar-waves-light.png')} />
          </div>
        </div>
        <div className="bottomArea">
          { sensor && <HistoryGraph sensor={sensor} /> }
        </div>
      </SidebarDiv>;
  }
}

const SidebarDiv = styled.div`
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow-y: auto;

  & .waves img {
    width: 100%;
    height: 50px; /* xxx */
    margin-bottom: -20px;
    display: block;
  }

  & .bottomArea {
    display: 'flex';
    flex-direction: 'column';
    flex: 1;
  }
`;