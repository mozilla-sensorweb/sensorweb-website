import { observable, action, computed, asFlat } from 'mobx';
import * as _ from 'lodash';
import Location from './Location';
export { default as Location } from './Location';

export default class Sensor {
  id: string;
  @observable location: Location;
  @observable knownReadings: SensorReading[] = asFlat([]);

  constructor(id: string, location: Location) {
    this.id = id;
    this.location = location;
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

  @action fleshOutFakeReadings() {
    this.knownReadings.forEach((reading) => {
      reading.humidity = Math.random() * 100;
      reading.temperature = Math.random() * 30;
    });
  }

  @action populateWithFakeReadings() {
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
  date: Date;
  pm: number;
  temperature?: number;
  humidity?: number;

  constructor(date: Date) {
    this.date = date;
  }

  toString() {
    return `<SensorReading ${this.date.toISOString()} - pm: ${this.pm}, temp: ${this.temperature}>`;
  }
}