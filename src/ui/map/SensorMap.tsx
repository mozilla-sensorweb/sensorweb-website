import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { when, autorun, ObservableMap } from 'mobx';
import { observer } from 'mobx-react';
import { renderOnResize, ResizeState } from '../renderOnResize';

import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sensor, Location } from '../../state';

import LeafletLoader from './LeafletLoader';
import SensorMarker from './SensorMarker';


const { default: styled, injectGlobal } = require<any>('styled-components');

let leafletLoader = new LeafletLoader();

interface SensorMapProps {
  style?: any;
  knownSensors: ObservableMap<Sensor>;
  selectedSensor?: Sensor;
  currentGpsLocation?: Location;
  onClickSensor(sensor?: Sensor): void;
  onMapLoaded(map: L.Map): void;
}

const StyledMap = styled.div`
  background: #F5F6F7;
  flex-grow: 1;
`;

@renderOnResize
@observer
export default class SensorMap extends React.Component<SensorMapProps, ResizeState> {
  el: HTMLElement;
  map?: L.Map;
  markerLayerDiv: HTMLElement;
  sensorsToMarkers: Map<Sensor, L.Marker> = new Map();
  didInitialSize = false;

  render() {
    return (
      <StyledMap innerRef={(el: any) => this.el = el}>
      </StyledMap>
    );
  }

  componentDidMount() {
    // XXX cancel!
    let cancel = when(() => leafletLoader.loaded, () => {
      this.loadMap();
    });

  }

  componentWillUnmount() {
    if (this.markerLayerDiv) {
      ReactDOM.unmountComponentAtNode(this.markerLayerDiv);
    }
  }

  componentDidUpdate() {
    if (this.map) {
      if (this.state.width > 0 && !this.didInitialSize) {
        this.didInitialSize = true;
        this.map.invalidateSize(false);
      } else {
        this.map.invalidateSize(true);
      }

    }
    this.renderMarkerLayer();
  }

  componentWillReceiveProps(nextProps: SensorMapProps) {
    if (!this.props.currentGpsLocation && nextProps.currentGpsLocation && this.map) {
      this.map.panTo(nextProps.currentGpsLocation.toGoogle());
    }
  }

  renderMarkerLayer() {
    console.log('renderMarkerLayer', new Error().stack);
    if (!this.map) {
      return;
    }
    const bounds = this.map.getBounds();
    // Remove markers that are no longer in bounds.
    this.sensorsToMarkers.forEach((marker, sensor) => {
      if (!bounds.contains(marker.getLatLng())) {
        this.map!.removeLayer(marker);
        this.sensorsToMarkers.delete(sensor);
      }
    });
    // Add known sensors that are in bounds.
    this.props.knownSensors.forEach((sensor: Sensor) => {
      if (!bounds.contains(sensor.location.toGoogle())) {
        return;
      }
      let marker = this.sensorsToMarkers.get(sensor);
      if (!marker) {
        marker = L.marker(sensor.location.toGoogle(), {
          icon: L.divIcon({})
        }).addTo(this.map!);
        marker.on('click', () => this.props.onClickSensor(sensor));
        this.sensorsToMarkers.set(sensor, marker);
      }
      const isSelected = (sensor === this.props.selectedSensor);
      ReactDOM.render(
        <SensorMarker
          sensor={sensor}
          selected={isSelected}
          />, marker.getElement());
    });
  }

  loadMap() {
    const isMobile = ('ontouchstart' in document.documentElement);
    this.map = L.map(this.el, {
      zoomControl: false,
      center: [23.7, 120.96],
      zoom: 11,
      attributionControl: true,
      trackResize: false,
      boxZoom: false,
    } as L.MapOptions);

    if (!isMobile) {
      this.map.addControl(L.control.zoom({ position: 'topright' }));
    }

    this.map.addLayer(L.tileLayer('http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {//'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Tiles by Carto, CC-BY-3.0. Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>'
    }));


    this.map.on('move', () => {
      this.renderMarkerLayer();
    });

    if (this.props.currentGpsLocation) {
      this.selectLocation(this.props.currentGpsLocation);
    }

    this.addGpsControl();

    let centerChangedHandler = _.debounce(this.onMapCenterChanged.bind(this), 300);
    //this.disposers.push(centerChangedHandler);
    this.map.on('move', centerChangedHandler);
    this.map.on('click', this.onClick);
    this.map.on('gps', this.onGps);
    this.onMapCenterChanged();

    this.props.onMapLoaded(this.map);

    autorun(() => {
      this.renderMarkerLayer();
    });
    window.dispatchEvent(new CustomEvent('READY'));
  }

  gpsControl: HTMLElement;

  onClick = () => {
    this.props.onClickSensor(undefined);
  }

  get isCurrentlyTrackingGps() {
    if (!this.map) {
      return false;
    }
    const center = this.map.getCenter().wrap();
    return this.props.currentGpsLocation && this.map &&
      this.props.currentGpsLocation.equals(new Location(center.lat, center.lng));
  }

  onMapCenterChanged() {
    this.gpsControl.classList.toggle('following', this.isCurrentlyTrackingGps);
    this.gpsControl.style.display = (this.props.currentGpsLocation ? '' : 'none');
  }

  selectLocation(location: Location) {
    if (this.map) {
      this.map.panTo(location.toGoogle());
    }
  }

  onGps = () => {
    this.gpsControl.classList.add('following');
    this.props.currentGpsLocation && this.selectLocation(this.props.currentGpsLocation);
  }

  addGpsControl() {
    this.gpsControl = document.createElement('div');

    const control: L.Control = new (L.Control.extend({
      options: {
        position: 'topright'
      },

      onAdd: (map: L.Map) => {
        let controlText = document.createElement('img');
        this.gpsControl.classList.add('gps-control');
        this.gpsControl.classList.add('leaflet-bar');
        controlText.src = require<string>('../../assets/gps-pointer.svg');
        this.gpsControl.appendChild(controlText);
        this.gpsControl.onclick = (e) => {
          e.stopPropagation();
          map.fire('gps');
        };
        return this.gpsControl;
      }
    }))();
    control.addTo(this.map!);
  }
}

injectGlobal`
  .leaflet-top {
    top: 3.1rem !important;
  }

  .leaflet-bar a {
    line-height: 26px !important; /* who knows */
  }

  .gps-control {
    background-color: #fff;
    box-shadow: 0px 1px 4px -1px rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    cursor: pointer;
    text-align: center;
    margin-top: 10px;
    margin-right: 10px;
    & img {
      width: 30px;
      height: 25px;
      padding: 7px 7px 2px 6px;
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

