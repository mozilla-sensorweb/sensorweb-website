import { Location } from './state';

export function findLocation(): Promise<Location> {
  return findLocationWithMozillaLocationService();
}



async function findLocationWithMozillaLocationService() {
  return new Promise<Location>((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.addEventListener('load', (evt: ProgressEvent) => {
      try {
        let json = JSON.parse(request.responseText);
        if (json && json.location) {
          resolve(new Location(json.location.lat, json.location.lng));
        } else {
          reject(json);
        }
      } catch (e) {
        reject(e);
      }
    });
    request.addEventListener('error', (evt: ProgressEvent) => {
      reject(evt);
    });
    request.open('GET', 'https://location.services.mozilla.com/v1/geolocate?key=test', true);
    request.send();
  });
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