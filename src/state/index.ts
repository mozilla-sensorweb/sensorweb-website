import { observable, action, ObservableMap, computed } from 'mobx';
import * as _ from 'lodash';
import Location from './Location';
import Sensor from './Sensor';
export { default as Location } from './Location';
export { default as Sensor, SensorReading } from './Sensor';
import Settings from './Settings';

function geolocate(address: string) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.addEventListener('load', (evt: ProgressEvent) => {
      try {
        resolve(JSON.parse(request.responseText));
      } catch (e) {
        reject(e);
      }
    });
    request.addEventListener('error', (evt: ProgressEvent) => {
      reject(evt);
    });
    request.open('GET', `http://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(address)}`, true);
    request.send();
  });
}

export class AppState {
  @observable currentGpsLocation?: Location;
  @observable selectedSensor?: Sensor;
  @observable knownSensors = new ObservableMap<Sensor>();
  @observable viewingSensorDetails = false;
  @observable isSearchingForLocation = false;
  @observable isFavoritingSensor = false;
  settings = new Settings();

  map?: L.Map;

  @action setCurrentGpsLocation(location: Location) {
    this.currentGpsLocation = location;
    this.selectedSensor = this.nearestSensor;
    // if (this.map) {
    //   this.map.panTo(this.currentGpsLocation.toGoogle());
    // }
  }

  @action viewSensor(sensor?: Sensor, pan = false) {
    this.selectedSensor = sensor || undefined; // we explicitly allow undefined
    if (sensor && this.map && pan) {
      this.map.panTo(sensor.location.toGoogle());
    }
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


  @action async searchForLocation(address: string) {
    if (!this.map) {
      return; // XXX: we need to wait for map to load and retry
    }
    this.isSearchingForLocation = true;
    try {
      const results: any = await geolocate(address);
      console.log('geo', results);
      if (results[0]) {
        let loc = new Location(parseFloat(results[0].lat), parseFloat(results[0].lon));
        this.map!.panTo(loc.toGoogle());
        this.viewSensor(this.closestSensorToLocation(loc));
      }
    } catch(e) {
      console.error(e);
      return;
    } finally {
      this.isSearchingForLocation = false;
    }
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
