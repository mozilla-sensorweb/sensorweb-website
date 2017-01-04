import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, autorun, action, when, ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import { pmToColor } from './colorScale';
import { renderOnResize, ResizeState } from './renderOnResize';

import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sensor, Location } from '../state';
import ColorIndexOverlay from './ColorIndexOverlay';

import NumberTween from './NumberTween';

const MAPS_API_KEY = 'AIzaSyA_QULMpHLgnha_jMe-Ie-DancN1Bz4uEE';

const { default: styled, css, injectGlobal } = require<any>('styled-components');

injectGlobal`
  .gps-control {
    background-color: #fff;
    box-shadow: 0px 1px 4px -1px rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    cursor: pointer;
    text-align: center;
    margin-top: 10px;
    margin-right: 10px;
    & img {
      width: 28px;
      height: 25px;
      padding: 7px 8px 2px 6px;
      opacity: 0.55;
    }
  }

  .gps-control.following {
    background-color: #cef;
    & img {
      opacity: 1;
    }
  }
`

class GoogleMapsLoader {
  @observable loaded = false;
  readonly scriptSrc: string;
  private timeoutId: number;

  constructor(apiKey: string) {
    const CALLBACK_NAME = 'initMap';
    (window as any)[CALLBACK_NAME] = this.onMapsReady.bind(this);
    this.scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${CALLBACK_NAME}`;
    this.attemptLoad();
  }

  attemptLoad() {
    let script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = this.scriptSrc;
    script.onerror = this.onScriptError.bind(this);
    this.timeoutId = setTimeout(this.onScriptError.bind(this), 5000);
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  private finishLoad() {
    clearTimeout(this.timeoutId);
  }

  onScriptError(e: any) {
    this.finishLoad();
    setTimeout(() => {
      this.attemptLoad();
    }, 1000);
  }

  @action onMapsReady() {
    this.finishLoad();
    this.loaded = true;
  }
}

let googleMapsLoader = new GoogleMapsLoader(MAPS_API_KEY);

declare class SensorMarkerOverlayView extends google.maps.OverlayView {
  sensor: Sensor;
  constructor(sensor: Sensor, map: google.maps.Map, onClick: Function);
}


interface SensorMarkerProps {
  point: { x: number, y: number };
  sensor: Sensor;
  onClick: (sensor: Sensor) => void;
  selected: boolean;
}

const MarkerShadow = styled.div`
  opacity: ${(props: any) => props.selected ? 1 : 0};
  transition: opacity 300ms ease-out, transform 300ms cubic-bezier(0.355, 1.395, 0.605, 0.975);
  transform: scale(${(props: any) => props.selected ? 1 : 0.5});
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const MarkerNumberWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);
  transition: background-color 2s ease;
  width: 100%;
  height: 100%;
  background-color: ${(props: any) => props.backgroundColor};

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

@observer
class SensorMarker extends React.Component<SensorMarkerProps, {}> {
  constructor(props: SensorMarkerProps) {
    super(props);
  }

  render() {
    const pm = this.props.sensor.currentPm || 0;
    let bgColor = d3.hsl(d3.rgb(pmToColor(pm, 'dark')));
    let shadowColor = d3.hsl(bgColor);
    shadowColor.opacity = 0.6;

    return <SensorMarkerStyledDiv
      style={{ left: this.props.point.x, top: this.props.point.y }}
      onClick={(e: any) => this.props.onClick(this.props.sensor)}>
      <MarkerShadow
        selected={this.props.selected}
        style={{boxShadow: `0 0 0 10px ${shadowColor}`}} />
      <MarkerNumberWrapper
        backgroundColor={bgColor}><NumberTween value={pm} />
      </MarkerNumberWrapper>
    </SensorMarkerStyledDiv>;
  }
}

interface SensorMarkerLayerProps {
  onClickSensor: (sensor: Sensor) => void;
  bounds: google.maps.LatLngBounds;
  projection: google.maps.MapCanvasProjection;
  knownSensors: ObservableMap<Sensor>;
  selectedSensor?: Sensor;
}
class SensorMarkerLayer extends React.Component<SensorMarkerLayerProps, {}> {
  render() {
    return <div className="SensorMarkerLayer">
      {this.props.knownSensors.values()
        .filter(sensor => this.props.bounds.contains(sensor.location.toGoogle()))
        .map(sensor => {
          return <SensorMarker
            key={sensor.id}
            point={this.props.projection.fromLatLngToDivPixel(sensor.location.toGoogle())}
            sensor={sensor}
            selected={sensor === this.props.selectedSensor}
            onClick={this.props.onClickSensor}
            />;
        })}
    </div>;
  }
}

interface SearchBoxProps {
  onSearch(address: string): void;
  searching?: boolean;
}


const StyledSearchBox = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 30rem;
  max-width: calc(100% - 2rem);
  z-index: 10;
  & input {
    font-size: 1.5rem;
    padding: .5rem;
    width: 100%;
    border-radius: 3px;
    font-family: inherit;
    border: 1px solid #bbb;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
    -webkit-appearance: none; /* no inset shadow */

    &[disabled] {
      color: #aaa;
      opacity: 1;
    }
  }
`;

@observer
class SearchBox extends React.Component<SearchBoxProps, {}> {
  @observable currentValue = '';
  input: HTMLInputElement;

  @action onChange(newValue: string) {
    this.currentValue = newValue;
  }

  @action onEnter() {
    let value = this.currentValue;
    this.currentValue = '';
    this.input.blur();
    this.props.onSearch(value);
  }

  render() {
    return <StyledSearchBox>
      <input
        type="text"
        ref={el => this.input = el}
        value={this.props.searching ? 'Searching... ' : this.currentValue}
        disabled={this.props.searching}
        placeholder="Enter Address"
        onKeyPress={(e) => e.key === 'Enter' && this.onEnter()}
        onChange={(e) => this.onChange(e.currentTarget.value)} />
    </StyledSearchBox>;
  }
}


interface SensorMapProps {
  knownSensors: ObservableMap<Sensor>;
  selectedSensor?: Sensor;
  currentGpsLocation?: Location;
  onClickSensor(sensor: Sensor): void;
  onSetLocation(location: Location): void;
}

const StyledMap = styled.div`
  margin: 0.5rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.3);
  position: relative;
  background: #F5F6F7;
  flex-grow: 1;
`;

@renderOnResize
@observer
export default class SensorMap extends React.Component<SensorMapProps, {}> {
  el: HTMLElement;
  map?: google.maps.Map;
  markerLayerDiv: HTMLElement;
  markers: google.maps.OverlayView[] = [];
  projection: google.maps.MapCanvasProjection;
  @observable searching: boolean;

  render() {
    return (
      <StyledMap innerRef={(el: any) => this.el = el}>
        <SearchBox
          searching={this.searching}
          onSearch={this.onSearch} />
        <ColorIndexOverlay />
      </StyledMap>
    );
  }

  componentDidMount() {
    let cancel = when(() => googleMapsLoader.loaded, () => {
      this.loadMap();
    });
  }

  componentWillUnmount() {
    if (this.markerLayerDiv) {
      ReactDOM.unmountComponentAtNode(this.markerLayerDiv);
    }
  }

  componentDidUpdate() {
    this.map && google.maps.event.trigger(this.map, 'resize');
    this.renderMarkerLayer();
  }

  componentWillReceiveProps(nextProps: SensorMapProps) {
    if (!this.props.currentGpsLocation && nextProps.currentGpsLocation && this.map) {
      this.map.setCenter(nextProps.currentGpsLocation.toGoogle());
    }
  }

  renderMarkerLayer() {
    if (!this.projection || !this.map) {
      return;
    }
    ReactDOM.render(<SensorMarkerLayer
      bounds={this.map.getBounds()}
      projection={this.projection}
      knownSensors={this.props.knownSensors}
      selectedSensor={this.props.selectedSensor}
      onClickSensor={this.props.onClickSensor} />, this.markerLayerDiv);
  }

  loadMap() {
    this.map = new google.maps.Map(this.el, {
      center: { lat: 23.7, lng: 120.96 },
      zoom: 11,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: 'greedy',
      zoomControl: true,
      noClear: true
    } as google.maps.MapOptions);

    this.map.addListener('bounds_changed', () => {
      this.renderMarkerLayer();
    });

    let overlay = new google.maps.OverlayView();
    overlay.onAdd = () => {
      this.markerLayerDiv = document.createElement('div');
      overlay.getPanes().overlayMouseTarget.appendChild(this.markerLayerDiv);
    };
    overlay.onRemove = () => {
      this.markerLayerDiv.parentElement!.removeChild(this.markerLayerDiv);
    };
    overlay.draw = () => {
      this.projection = overlay.getProjection();
      this.renderMarkerLayer();
    };
    overlay.setMap(this.map);

    if (this.props.currentGpsLocation) {
      this.selectLocation(this.props.currentGpsLocation);
    }

    this.addGpsControl();

    let centerChangedHandler = _.debounce(this.onMapCenterChanged.bind(this), 500);
    //this.disposers.push(centerChangedHandler);
    this.map.addListener('center_changed', centerChangedHandler);
    this.onMapCenterChanged();

    window.dispatchEvent(new CustomEvent('READY'));
  }

  gpsControl: HTMLElement;

  get isCurrentlyTrackingGps() {
    if (!this.map) {
      return false;
    }
    const unwrappedCenter = this.map.getCenter();
    const center = new google.maps.LatLng(unwrappedCenter.lat(), unwrappedCenter.lng());
    return this.props.currentGpsLocation && this.map &&
      this.props.currentGpsLocation.equals(new Location(center.lat(), center.lng()));
  }

  onSearch = (address: string) => {
    if (!this.map) {
      return; // XXX: we need to wait for map to load and retry
    }
    this.searching = true;
    let geo = new google.maps.Geocoder();
    geo.geocode({ address }, (results, status) => {
      this.searching = false;
      // XXX if no address, handle error (maybe clear input?)
      if (!results || !results[0]) {
        console.log('unable to geocode: ' + status);
        //this.addressInput.blur();
        return;
      }
      let loc = results[0].geometry.location;
      this.map!.panTo(loc);
      this.props.onSetLocation(new Location(loc.lat(), loc.lng()));
      // runInAction(() => {
      //   this.selectLocation(results[0].geometry.location);
      //   this.locationString = results[0].formatted_address;
      //   this.typedAddress = '';
      // });
    });
  }

  onMapCenterChanged() {
    this.gpsControl.classList.toggle('following', this.isCurrentlyTrackingGps);
    this.gpsControl.style.display = (this.props.currentGpsLocation ? '' : 'none');
  }

  selectLocation(location: Location) {
    if (this.map) {
      this.map.setCenter(location.toGoogle());
    }
  }

  addGpsControl() {
    this.gpsControl = document.createElement('div');
    let controlText = document.createElement('img');
    this.gpsControl.classList.add('gps-control');
    controlText.src = require<string>('../assets/gps-pointer.svg');
    this.gpsControl.appendChild(controlText);
    this.gpsControl.onclick = (e) => {
      this.props.currentGpsLocation && this.selectLocation(this.props.currentGpsLocation);
    };
    this.map!.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.gpsControl);
  }
}