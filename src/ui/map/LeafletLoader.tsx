import { observable, action } from 'mobx';

/**
 * Asynchronously loads the Google Maps JavaScript SDK.
 * You can observe the `.loaded` observable to know when the map has loaded.
 * NOTE: While the TypeScript typings for the `google.maps` namespace are compile-time available,
 * the actual code is not available until it has been loaded asynchronously! That's why we need this.
 */
export default class LeafletLoader {
  @observable loaded = false;
  readonly scriptSrc: string;

  constructor() {

    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/leaflet@1.0.2/dist/leaflet.css';
    link.rel = 'stylesheet';
    head.appendChild(link);

    let script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://unpkg.com/leaflet@1.0.2/dist/leaflet.js';
    script.onerror = this.onScriptError.bind(this);
    script.onload = this.onMapsReady.bind(this);
    head.appendChild(script);
  }

  onScriptError(e: any) {
    console.error('Unable to load leaflet maps!', e);
  }

  @action onMapsReady() {
    this.loaded = true;
  }
}
