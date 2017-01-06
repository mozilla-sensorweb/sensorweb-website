import { observable, action } from 'mobx';

/**
 * Asynchronously loads the Google Maps JavaScript SDK.
 * You can observe the `.loaded` observable to know when the map has loaded.
 * NOTE: While the TypeScript typings for the `google.maps` namespace are compile-time available,
 * the actual code is not available until it has been loaded asynchronously! That's why we need this.
 */
export default class GoogleMapsLoader {
  @observable loaded = false;
  readonly scriptSrc: string;
  private timeoutId: number;

  constructor(apiKey: string) {
    const CALLBACK_NAME = 'initMap';
    (window as any)[CALLBACK_NAME] = this.onMapsReady.bind(this);
    this.scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${CALLBACK_NAME}`;
    this.attemptLoad();
  }

  attemptLoad() {
    let script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = this.scriptSrc;
    script.onerror = this.onScriptError.bind(this);
    this.timeoutId = setTimeout(this.onScriptError.bind(this), 5000);
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  private finishLoad() {
    clearTimeout(this.timeoutId);
  }

  onScriptError(e: any) {
    this.finishLoad();
    setTimeout(() => {
      this.attemptLoad();
    }, 1000);
  }

  @action onMapsReady() {
    this.finishLoad();
    this.loaded = true;
  }
}
