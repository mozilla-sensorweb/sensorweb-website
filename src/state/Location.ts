export default class Location {
  readonly latitude: number;
  readonly longitude: number;

  constructor(latitude: number, longitude: number) {
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

  // Google Maps must be loaded for this to work.
  // That's why we don't just use a raw google.maps.LatLng object.
  private google?: google.maps.LatLng;
  toGoogle() {
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

function toRadians(n: number) {
  return n * Math.PI / 180;
}

function nearlyEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.005;
}
