import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { when, ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import { renderOnResize, ResizeState } from '../renderOnResize';

import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sensor, Location } from '../../state';

import GoogleMapsLoader from './GoogleMapsLoader';
import { SensorMarkerLayer } from './SensorMarker';


const { default: styled, injectGlobal } = require<any>('styled-components');

// Start loading the Google Maps JavaScript SDK now!
const MAPS_API_KEY = 'AIzaSyA_QULMpHLgnha_jMe-Ie-DancN1Bz4uEE';
let googleMapsLoader = new GoogleMapsLoader(MAPS_API_KEY);

interface SensorMapProps {
  style?: any;
  knownSensors: ObservableMap<Sensor>;
  selectedSensor?: Sensor;
  currentGpsLocation?: Location;
  onClickSensor(sensor?: Sensor): void;
  onMapLoaded(map: google.maps.Map): void;
}

const StyledMap = styled.div`
  background: #F5F6F7;
  flex-grow: 1;
`;

@renderOnResize
@observer
export default class SensorMap extends React.Component<SensorMapProps, ResizeState> {
  el: HTMLElement;
  map?: google.maps.Map;
  markerLayerDiv: HTMLElement;
  markers: google.maps.OverlayView[] = [];
  projection: google.maps.MapCanvasProjection;
  didInitialSize = false;

  render() {
    return (
      <StyledMap innerRef={(el: any) => this.el = el}>
        {/*<ColorIndexOverlay />*/}
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
    console.log('updated', this.state);
    if (this.map) {
      // The map might not know its size initially. When we first get the size,
      // update our center to point to the new, resized center.
      const center = this.map!.getCenter();
      google.maps.event.trigger(this.map, 'resize');
      if (this.state.width > 0 && !this.didInitialSize) {
        this.didInitialSize = true;
        this.map.setCenter(center);
      }

    }
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
    this.map.addListener('click', this.onClick)
    this.onMapCenterChanged();

    this.props.onMapLoaded(this.map);

    window.dispatchEvent(new CustomEvent('READY'));
  }

  gpsControl: HTMLElement;

  onClick = () => {
    this.props.onClickSensor();
  }

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
    controlText.src = require<string>('../../assets/gps-pointer.svg');
    this.gpsControl.appendChild(controlText);
    this.gpsControl.onclick = (e) => {
      this.props.currentGpsLocation && this.selectLocation(this.props.currentGpsLocation);
    };
    this.map!.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.gpsControl);
  }
}

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
`;