import * as React from 'react';
import * as d3 from 'd3';
import * as physics from '../physics';

import { Motion, spring } from 'react-motion';
import { pmToColor, pmToIndex } from './colorScale';
import { Sensor, Location } from '../state';
import { observer } from 'mobx-react';
import HistoryGraph from './HistoryGraph';

// http://taqm.epa.gov.tw/taqm/tw/fpmi.htm

function pmToQualityString(pm: number) {
  const strs = ['Amazing', 'Great', 'Good', 'Fair', 'Questionable', 'Risky', 'Bad', 'Really Bad', 'Terrible', 'Apocalyptic'];
  return strs[pmToIndex(pm)];
}


const SummaryBox = observer(function ({ sensor, currentLocation, theme }:
  { sensor?: Sensor, currentLocation: Location | undefined, theme: 'light'|'dark' }) {

  let displayDistance = null;
  if (currentLocation && sensor) {
    const km = sensor.location.distanceTo(currentLocation);
    displayDistance = km.toFixed(1) + 'km';
  }

  const value = sensor && sensor.currentPm || 0;
  const color = pmToColor(value, theme);

  return (
    <div className={['Section', !sensor ? 'Section--invisible' : ''].join(' ')}>
      <div className="SummaryBox">
        <div className="SummaryBox__header">
          <div className="SummaryBox__airText"
            style={{ color }}>Air Quality is {pmToQualityString(value)}!</div>
        </div>
        <ul className="SmallTextList">
          {displayDistance && <li>{displayDistance} from your location</li>}
          <li>(?) views this week</li>
        </ul>
        <div>
          <div className="SummaryBox__mainValue">
            <div className="value" style={{ color }}>{value}</div>
            <div className="label">µg/m³<br />PM2.5</div>
          </div>
        </div>
      </div>
    </div>
  );
});

let CurrentDetailsItem = ({value, label}: any) => (
  <div className="CurrentDetailsItem">
    <div className="CurrentDetailsItem__value">{value}</div>
    <div className="CurrentDetailsItem__label">{label}</div>
  </div>
)

const CurrentDetails = observer(function ({ sensor, theme }: { theme: string, sensor?: Sensor }) {
  let displayTemp = '--°';
  let displayHumidity = '--%';
  if (sensor && sensor.currentTemperature !== undefined) {
    const celsius = sensor.currentTemperature;
    displayTemp = Math.round(celsius * 1.8 + 32) + '°F';
  }
  if (sensor && sensor.currentHumidity !== undefined) {
    displayHumidity = sensor.currentHumidity + '%';
  }
  return (
    <div className={['Section', !sensor ? 'Section--invisible' : ''].join(' ')}>
      <div className="CurrentDetails">
        <CurrentDetailsItem value={displayTemp} label="Temperature" />
        <CurrentDetailsItem value={displayHumidity} label="Humidity" />
        <CurrentDetailsItem value="Cloudy" label="Conditions" />
      </div>
    </div>
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

function CompactFooter({ opacity, sensor }: { opacity: number, sensor?: Sensor }) {
  const pm = sensor && sensor.currentPm || 0;
  return <div className="CompactFooter" style={{
    zIndex: 1,
    opacity: opacity,
    visibility: opacity === 0 ? 'hidden' : 'visible',
    backgroundColor: pmToColor(pm || 0, 'dark')
  }}>
    <div className="CompactFooter__value">{pm}</div>
    <div className="CompactFooter__label">µg/m³<br />PM2.5</div>
    <div className="CompactFooter__text">Air Quality is {pmToQualityString(pm)}!</div>
  </div>;
}

interface SidebarProps {
  currentLocation?: Location;
  selectedSensor?: Sensor;
  isMobile: boolean
}

//import { observable} from 'mobx';

//@observer
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
//  @observable foo = 1;

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
      const newMaxY = this.el.parentElement.getBoundingClientRect().height - this.minimizedHeight;
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
    let y = !this.props.isMobile ? this.state.minY :
      (this.state.dragging || this.state.loading) ? this.state.y : spring(this.state.y, this.SPRING_PROPS);
    let percentage = !this.props.isMobile ? 0 : this.state.y / this.state.maxY;

    let sensor = this.props.selectedSensor;
    let theme: 'light' | 'dark' = 'light';
    console.log('render sidebar', !!sensor);

    return <Motion style={{ y: y }}>{({ y }: any) =>
      <div ref={el => this.el = el}
        style={{ transform:
          !this.props.isMobile ? 'none' :
          this.state.loading ? `translateY(calc(100% - 80px))` : `translate3d(0, ${y}px, 0)` }}
        className={['Sidebar', 'MainSection', this.state.dragging && 'dragging', 'Sidebar--' + theme].join(' ')}>
        <CompactFooter
          opacity={percentage}
          sensor={sensor} />
        <div style={{background: `url(${require<string>('../assets/taipei.jpg')})`,
          backgroundSize: 'cover', display: 'flex', flexDirection: 'column', flex: '0 0 auto'}}>
          <SummaryBox
            theme={theme}
            currentLocation={this.props.currentLocation}
            sensor={sensor} />
          <CurrentDetails theme={theme} sensor={sensor} />
          <div className="Sidebar__waves">
            <img src={theme === 'dark'
                      ? require<string>('../assets/sidebar-waves-dark.png')
                      : require<string>('../assets/sidebar-waves-light.png')} />
          </div>
        </div>
        <div className="Sidebar__bottomArea">
          { sensor && <HistoryGraph sensor={sensor} theme={theme} /> }

        </div>
        {/*<AirPollutionIndex value={34} />*/}

        {/*<ParticulateWidget dataSource={dataSource} />*/}
      </div>
    }</Motion>;
  }
}
