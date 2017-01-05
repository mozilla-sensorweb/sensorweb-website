import { observable, action, ObservableMap, computed } from 'mobx';
import * as _ from 'lodash';
import Location from './Location';
import Sensor from './Sensor';
export { default as Location } from './Location';
export { default as Sensor, SensorReading } from './Sensor';

export class AppState {
  @observable currentGpsLocation?: Location;
  @observable selectedSensor?: Sensor;
  @observable knownSensors = new ObservableMap<Sensor>();
  @observable viewingSensorDetails = false;
  @observable isSearchingForLocation = false;

  map?: google.maps.Map;

  @action setCurrentGpsLocation(location: Location) {
    this.currentGpsLocation = location;
    this.selectedSensor = this.nearestSensor;
    // if (this.map) {
    //   this.map.panTo(this.currentGpsLocation.toGoogle());
    // }
  }

  @action viewSensor(sensor: Sensor) {
    this.selectedSensor = sensor;
  }

  @action viewSensorDetails(sensor: Sensor) {
    this.viewingSensorDetails = true;
  }
  @action stopViewingSensorDetails() {
    this.viewingSensorDetails = false;
  }

  @action onMapLoaded(map: google.maps.Map) {
    this.map = map;
  }

  @action searchForLocation(address: string) {
    if (!this.map) {
      return; // XXX: we need to wait for map to load and retry
    }
    this.isSearchingForLocation = true;
    let geo = new google.maps.Geocoder();
    geo.geocode({ address }, (results, status) => {
      this.isSearchingForLocation = false;
      // XXX if no address, handle error (maybe clear input?)
      if (!results || !results[0]) {
        console.log('unable to geocode: ' + status);
        return;
      }
      let loc = results[0].geometry.location;
      let location = new Location(loc.lat(), loc.lng());
      this.map!.panTo(loc);

      let closestSensor = this.closestSensorToLocation(location);
      if (closestSensor) {
        this.viewSensor(closestSensor);
      } else {
        this.selectedSensor = undefined;
      }
    });
  }

  closestSensorToLocation(location: Location) {
    const MAX_KM = 100;
    let minDistance = Infinity;
    let minSensor: Sensor | undefined;
    this.knownSensors.values().forEach((sensor) => {
      const dist = sensor.location.distanceTo(location);
      if (dist < minDistance && dist < MAX_KM) {
        minSensor = sensor;
        minDistance = dist;
      }
    });
    return minSensor;
  }

  @computed get nearestSensor(): Sensor | undefined {
    if (!this.currentGpsLocation) {
      return undefined;
    }
    return this.closestSensorToLocation(this.currentGpsLocation);
  }

  @action initializeWithRandomData() {
    for (let i = 0; i < 100; i++) {
      this.learnAboutSensors([Sensor.random()]);
    }
  }

  @action learnAboutSensors(sensors: Sensor[]) {
    sensors.forEach((sensor) => {
      this.knownSensors.set(sensor.id, sensor);
    });
  }
}
