import { Location } from './state';
import { fetchJson } from './utils';

export function findLocation(): Promise<Location> {
  return findLocationWithMozillaLocationService();
}



async function findLocationWithMozillaLocationService() {
  const json = await fetchJson<any>('https://location.services.mozilla.com/v1/geolocate?key=test');
  if (json.location) {
    return new Location(json.location.lat, json.location.lng);
  } else {
    throw new Error('invalid location json: ' + JSON.stringify(json));
  }
}

async function findLocationWithBrowser() {
  return new Promise<Location>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      resolve(new Location(position.coords.latitude, position.coords.longitude));
    }, (err) => {
      reject(err);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000
    });
  });
}


// async function findLocation() {
//   try {
//     appState.setCurrentGpsLocation(await mozillaLocationService());
//     console.log('Location via Mozilla:', appState.currentGpsLocation);
//   } catch (e) {
//     console.error('Unable to get mozilla location:', e);
//   }
//   // try {
//   //   appState.setCurrentGpsLocation(await browserGeolocation());
//   //   console.log('Location via Browser:', appState.currentGpsLocation);
//   // } catch (e) {
//   //   console.error('Unable to get browser location:', e);
//   // }
// }

findLocation();