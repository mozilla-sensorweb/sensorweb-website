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

    return <div className={['SensorMarker', this.props.selected ? 'SensorMarker--selected' : null].join(' ')}
      style={{
        left: this.props.point.x,
        top: this.props.point.y,
      }}
      onClick={(e) => this.props.onClick(this.props.sensor)}>
      <div className="shadow" style={{boxShadow: `0 0 0 10px ${shadowColor}`}} />
      <span style={{ backgroundColor: bgColor }}><NumberTween value={pm} /></span>
    </div>;
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
            />
        })}
    </div>;
  }
}



interface SensorMapProps {
  knownSensors: ObservableMap<Sensor>;
  selectedSensor?: Sensor;
  currentGpsLocation?: Location;
  onClickSensor: (sensor: Sensor) => void;
}

@renderOnResize
export default class SensorMap extends React.Component<SensorMapProps, {}> {
  el: HTMLElement;
  map?: google.maps.Map;
  markerLayerDiv: HTMLElement;
  markers: google.maps.OverlayView[] = [];
  projection: google.maps.MapCanvasProjection;

  render() {
    return (
      <div ref={el => this.el = el} className="Map MainSection">
        <ColorIndexOverlay />
      </div>
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
      this.markerLayerDiv.parentElement.removeChild(this.markerLayerDiv);
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