import { observable, action, ObservableMap, computed, asFlat } from 'mobx';
import * as _ from 'lodash';

function toRadians(n: number) {
  return n * Math.PI / 180;
}
function nearlyEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.005;
}

export class Location {
  private google?: google.maps.LatLng;
  constructor(public latitude: number, public longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  equals(loc2: Location) {
    // Floating-point equality requires some fudge:
    return (nearlyEqual(this.latitude, loc2.latitude) && nearlyEqual(this.longitude, loc2.longitude));
  }

  toString() {
    return `<Location ${this.latitude} ${this.longitude}>`;
  }

  toGoogle() {
    // Maps must be loaded for this to work!
    if (!this.google) {
      this.google = new google.maps.LatLng(this.latitude, this.longitude);
    }
    return this.google;
  }

  distanceTo(loc2: Location) {
    // Haversine distance formula via http://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = toRadians(this.latitude);
    const φ2 = toRadians(loc2.latitude);
    const Δφ = toRadians(loc2.latitude - this.latitude);
    const Δλ = toRadians(loc2.longitude - this.longitude);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d / 1000;
  }
}


export class RootState {
  @observable currentGpsLocation?: Location;
  @observable selectedSensor?: Sensor;
  @observable knownSensors = new ObservableMap<Sensor>();

  constructor() {

  }

  @action setCurrentGpsLocation(location: Location) {
    this.currentGpsLocation = location;
    this.selectedSensor = this.nearestSensor;
  }

  @action viewSensor(sensor: Sensor) {
    this.selectedSensor = sensor;
    console.log('selected sensor', sensor)
  }

  @computed get nearestSensor(): Sensor | undefined {
    if (!this.currentGpsLocation) {
      return undefined;
    }
    let minDistance = Infinity;
    let minSensor: Sensor | undefined;
    this.knownSensors.values().forEach((sensor) => {
      const dist = sensor.location.distanceTo(this.currentGpsLocation!);
      if (dist < minDistance) {
        minSensor = sensor;
        minDistance = dist;
      }
    });
    return minSensor;
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

export class Sensor {
  id: string;
  @observable location: Location;
  @observable knownReadings: SensorReading[] = asFlat([]);

  constructor(id: string, location: Location) {
    this.id = id;
    this.location = location;

    // setInterval(action(() => {
    //   this.latestReading.pm = _.random(0, 75);
    // }), _.random(10000, 20000));
  }

  @action addReading(reading: SensorReading) {
    const index = _.sortedIndexBy(this.knownReadings, reading, r => r.date);
    this.knownReadings.splice(index, 0, reading);
  }

  @computed get latestReading(): SensorReading | undefined {
    return this.knownReadings[this.knownReadings.length - 1];
  }
  @computed get currentPm() {
    return this.latestReading ? this.latestReading.pm : 0;
  }
  @computed get currentTemperature() {
    return this.latestReading ? this.latestReading.temperature : 0;
  }
  @computed get currentHumidity() {
    return this.latestReading ? this.latestReading.humidity : 0;
  }

  static nextId = 0;

  getReadings() {
    if (this.knownReadings.length) {
      return this.knownReadings;
    }
    let startValue = _.random(20, 40);
    let arr: SensorReading[] = [];
    let max = _.random(30, 70);
    let min = _.random(0, 25);
    for (let i = 1; i < 60000; i++) {
      startValue = Math.min(max, Math.max(min, startValue + _.random(-3, 3)));
      let r = new SensorReading(new Date(Date.now() - i * 120000));
      r.pm = startValue;
      arr.push(r);
    }
    arr.reverse();
    this.knownReadings = arr;
    return this.knownReadings;
  }

  @action
  static random() {
    let reading = new SensorReading(new Date());
    reading.pm = _.random(0, 75);
    reading.temperature = _.random(0, 22);
    reading.humidity = _.random(0, 100);
    let sensor = new Sensor(
      ++Sensor.nextId + '',
      new Location(_.random(36, 38, true), _.random(-123, -121, true)));

    sensor.addReading(reading);
    return sensor;
  }

}

export class SensorReading {
  @observable date: Date;
  @observable pm: number;
  @observable temperature?: number;
  @observable humidity?: number;

  constructor(date: Date) {
    this.date = date;
  }
}