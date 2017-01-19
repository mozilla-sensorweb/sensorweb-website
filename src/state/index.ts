import { observable, action, ObservableMap, computed } from 'mobx';
import * as _ from 'lodash';
import Location from './Location';
import Sensor from './Sensor';
export { default as Location } from './Location';
export { default as Sensor, SensorReading } from './Sensor';
import Settings from './Settings';


export enum Tabs {
  Favorites,
  Map,
  Search
};

export class AppState {
  @observable showingSettingsPanel: boolean = false;
  @observable currentGpsLocation?: Location;
  @observable selectedSensor?: Sensor;
  @observable knownSensors = new ObservableMap<Sensor>();
  @observable viewingSensorDetails = false;
  @observable isFavoritingSensor = false;
  @observable currentTab = Tabs.Favorites;
  settings = new Settings();

  map?: L.Map;

  @action setCurrentGpsLocation(location: Location) {
    this.currentGpsLocation = location;
    this.selectedSensor = this.nearestSensor;
    // if (this.map) {
    //   this.map.panTo(this.currentGpsLocation.toGoogle());
    // }
  }

  @action goToLocation(location: Location) {
    if (!this.map) {
      console.error('Cannot go to location; map not loaded.');
      return;
    }
    this.map.panTo(location.toGoogle());
    this.viewSensor(this.closestSensorToLocation(location));

  }

  @action viewSensor(sensor?: Sensor, pan = false) {
    this.selectedSensor = sensor || undefined; // we explicitly allow undefined
    if (sensor && this.map && pan) {
      this.map.panTo(sensor.location.toGoogle());
    }
    this.currentTab = Tabs.Map;
  }

  @action viewSensorDetails(sensor: Sensor) {
    this.viewingSensorDetails = true;
  }
  @action stopViewingSensorDetails() {
    this.viewingSensorDetails = false;
  }

  @action onMapLoaded(map: L.Map) {
    this.map = map;
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
