export interface ResponseList<T> {
  '@iot.count': number;
  value: T[];
}

export interface IDatastream {
  '@iot.id': string;
  '@iot.selfLink': string;
  'Thing@iot.navigationLink': string;
  'Sensor@iot.navigationLink': string;
  'ObservedProperty@iot.navigationLink': string;
  'Observations@iot.navigationLink': string;
  name: string;
  description: string;
  unitOfMeasurement: {
    name: string;
    symbol: string;
    definition: string;
  };
  observedArea: null;
  observationType: string;

}

export interface IThing {
  '@iot.id': string;
  '@iot.selfLink': string;
  'Locations@iot.navigationLink': string;
  'HistoricalLocations@iot.navigationLink': string;
  'Datastreams@iot.navigationLink': string;
  name: string;
  description: string;
  properties: {
    owner: string;
    organisation: string;
  };
}

export interface ILocation {
  '@iot.id': string;
  '@iot.selfLink': string;
  'Things@iot.navigationLink': string;
  'HistoricalLocations@iot.navigationLink': string;
  name: string;
  description: string;
  encodingType: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

export interface IObservation {
  '@iot.id': string;
  '@iot.selfLink': string;
  'Datastream@iot.navigationLink': string;
  'FeatureOfInterest@iot.navigationLink': string;
  phenomenonTime: string;
  result: number;
  resultTime: string;
  parameters: null;
}
