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

  @action setCurrentGpsLocation(location: Location) {
    this.currentGpsLocation = location;
    this.selectedSensor = this.nearestSensor;
  }

  @action viewSensor(sensor: Sensor) {
    this.selectedSensor = sensor;
  }

  @action setViewingLocation(location: Location) {
    let closestSensor = this.closestSensorToLocation(location);
    if (closestSensor) {
      this.viewSensor(closestSensor);
    }
  }

  closestSensorToLocation(location: Location) {
    let minDistance = Infinity;
    let minSensor: Sensor | undefined;
    this.knownSensors.values().forEach((sensor) => {
      const dist = sensor.location.distanceTo(location);
      if (dist < minDistance) {
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
