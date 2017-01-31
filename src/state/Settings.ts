import { observable, autorun } from 'mobx';
import Sensor from './Sensor';
export interface FavoriteSensor {
  sensorId: string;
  name: string;
}

interface JSONSettings {
  units?: 'metric' | 'imperial';
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

    if (settings.units) {
      this.units = settings.units;
    }
    if (settings.favoriteSensors) {
      this.favoriteSensors = settings.favoriteSensors;
    }

    // Automatically save whenever the property changes.
    autorun(() => {
      localStorage.setItem('settings', JSON.stringify({
        units: this.units,
        favoriteSensors: this.favoriteSensors
      }));
    });
  }

  @observable units: 'metric' | 'imperial' = 'metric';
  @observable favoriteSensors: FavoriteSensor[] = [];

  getFavoriteSensor(sensor: Sensor) {
    return this.favoriteSensors.find(fav => fav.sensorId === sensor.id);
  }

  MAX_FAVORITE_NAME_LENGTH = 40;

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