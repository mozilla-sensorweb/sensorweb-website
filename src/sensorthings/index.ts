import * as _ from 'lodash';
import { ResponseList, IDatastream, IThing, ILocation, IObservation } from './types';
import { Sensor, SensorReading, Location } from '../state';
import moment from 'moment';

export default class STClient {
  //basePath = 'http://scratchpad.sensorup.com/OGCSensorThings/v1.0';
  basePath = 'https://api.bewrosnes.org/v1.0';

  constructor() {
  }

  async loadAll() {
    const datastreamList = await this.request<ResponseList<IDatastream>>('GET', '/Datastreams');
    datastreamList.value = datastreamList.value.filter(x => x['@iot.id'] >= '50');

    const observationLinks = datastreamList.value.map(item => item['Observations@iot.navigationLink']);
    const observations = await Promise.all(observationLinks.slice(0, 5).map(link => this.request<ResponseList<IObservation>>('GET', link)));

    const thingLinks = datastreamList.value.map(item => item['Thing@iot.navigationLink']);
    const things = await Promise.all(thingLinks.slice(0, 5).map(link => this.request<IThing>('GET', link)));

    const locationLinks = things.map(thing => thing['Locations@iot.navigationLink']);
    const locations = await Promise.all(locationLinks.slice(0, 5).map(link => this.request<ResponseList<ILocation>>('GET', link)));

    return things.map((thing, index) => {
      const loc = locations[index].value[0];
      const obs = observations[index].value;
      if (!loc) {
        console.log('no locations?', index);
        return null;
      }
      const sensor = new Sensor(
        thing['@iot.id'],
        new Location(loc.location.coordinates[0], loc.location.coordinates[1]));
      obs.forEach((o) => {
        let r = new SensorReading(moment(o.phenomenonTime).toDate()); // XXX: or resultTime?
        // XXX: OGCSensorThings returns a string, but our spec says we should return a number?
        r.pm = (typeof o.result === 'number' ? o.result : parseInt(o.result)) | 0;
        r.temperature = r.pm; // xxx
        sensor.addReading(r);
      });
      sensor.fleshOutFakeReadings();
      return sensor;
    }).filter(s => !!s) as Sensor[];
  }

  async request<T>(method: string, path: string) {
    console.log('REQUEST', method, path);
    if (!/:\/\//.test(path)) {
      path = this.basePath + path;
    }
    path = path.replace(':8000', ''); // XXX
    return new Promise<T>((resolve, reject) => {
      let request = new XMLHttpRequest();
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
      request.open(method, path, true);
      request.setRequestHeader('Cache-Control', 'no-cache');
      request.send();
    });
  }
}
