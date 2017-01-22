import { observable, autorun } from 'mobx';
import Sensor from './Sensor';
interface FavoriteSensor {
  sensorId: string;
  name: string;
}

interface JSONSettings {
  temperatureUnits?: 'c' | 'f';
  favoriteSensors?: FavoriteSensor[];
}

export default class Settings {
  constructor() {
    let settings: JSONSettings = {};
    try {
      settings = JSON.parse(localStorage.getItem('settings') || '{}');
    } catch (e) {
      settings = {};
    }

    if (settings.temperatureUnits) {
      this.temperatureUnits = settings.temperatureUnits;
    }
    if (settings.favoriteSensors) {
      this.favoriteSensors = settings.favoriteSensors;
    }

    // Automatically save whenever the property changes.
    autorun(() => {
      localStorage.setItem('settings', JSON.stringify({
        temperatureUnits: this.temperatureUnits,
        favoriteSensors: this.favoriteSensors
      }));
    });
  }

  @observable temperatureUnits: 'c' | 'f' = 'c';
  @observable favoriteSensors: FavoriteSensor[] = [];

  getFavoriteSensor(sensor: Sensor) {
    return this.favoriteSensors.find(fav => fav.sensorId === sensor.id);
  }

  favoriteSensor(sensor: Sensor, name: string) {
    this.favoriteSensors.push({
      sensorId: sensor.id,
      name
    });
  }

  unfavoriteSensor(sensor: Sensor) {
    this.favoriteSensors = this.favoriteSensors.filter(s => s.sensorId !== sensor.id);
  }
}