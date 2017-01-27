import * as React from 'react';
const { default: styled } = require<any>('styled-components');
import { AppState, Location } from '../state';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';
import { themed } from './theme';

import { List, ListItem, EmptyListItem } from './lists';


function geolocate(address: string) {
  return new Promise<any[]>((resolve, reject) => {
    const request = new XMLHttpRequest();
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
    request.open('GET', `http://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&namedetails=1&q=${encodeURIComponent(address)}`, true);
    request.send();
  });
}

interface SearchPaneProps {
  appState: AppState;
}

interface Suggestion {
  location: Location;
  name: string;
}

@observer
export default class SearchPane extends React.Component<SearchPaneProps, {}> {
  @observable currentValue = '';
  @observable searching = false;
  @observable suggestions: Suggestion[] = [];
  input: HTMLInputElement;

  updateSuggestions = debounce(async () => {
    this.suggestions = await this.fetchSuggestions(this.currentValue);
  }, 500);

  onChange(newValue: string) {
    this.currentValue = newValue;
    this.searching = true; // We will soon actually perform the search.
    this.updateSuggestions();
  }

  async onEnter() {
    let value = this.currentValue;
    this.currentValue = '';
    this.input.blur();
    this.suggestions = await this.fetchSuggestions(value);
    if (this.suggestions[0]) {
      this.props.appState.goToLocation(this.suggestions[0].location);
      this.reset();
    }
  }

  async fetchSuggestions(address: string) {
    try {
      this.searching = true;
      return (await geolocate(address)).map((result: any) => ({
        location: new Location(parseFloat(result.lat), parseFloat(result.lon)),
        name: formatSearchResult(result)
      }));
    } finally {
      this.searching = false;
    }
  }

  selectSuggestion(suggestion: Suggestion) {
    this.props.appState.goToLocation(this.suggestions[0].location);
    this.reset();
  }

  @action reset() {
    this.currentValue = '';
    this.suggestions = [];
  }

  render() {
    const suggestions = this.suggestions && this.suggestions.map((suggestion, index) => (
      <ListItem key={index} onClick={() => this.selectSuggestion(suggestion)}>{suggestion.name}</ListItem>
    ));
    return <Wrapper>
      <input
        type="text"
        ref={el => this.input = el}
        value={this.currentValue}
        placeholder="Enter Address"
        onKeyPress={(e) => e.key === 'Enter' && this.onEnter()}
        onChange={(e) => this.onChange(e.currentTarget.value)} />
      <List>
        {this.searching
          ? <EmptyListItem>Searching...</EmptyListItem>
          : (suggestions && suggestions.length) ?
            suggestions
            : !this.currentValue
              ? <EmptyListItem>Enter an address to find nearby sensors.</EmptyListItem>
              : <EmptyListItem>No Results</EmptyListItem>}
      </List>
    </Wrapper>;
  }
};


const Wrapper = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  background: ${themed.chromeEmptyBackground};

  & > input {
    font-size: 1.3rem;
    padding: 1rem;
    width: 100%;
    font-family: inherit;
    border: 0px none;
    -webkit-appearance: none; /* no inset shadow */
    color: ${themed.text};
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #aaa;

    &[disabled] {
      color: ${themed.disabledText};
      opacity: 1;
    }
  }
`;


function formatSearchResult(sr: SearchResult) {
  return sr.display_name;
  // const a = sr.address;
  // let s = sr.display_name;
  // if (/^zh/.test(navigator.language)) {
  //   s = `${a.country}\n${a.postcode}\n${a.city || a.town || a.village}\n${a.suburb || a.city_district || a.neighbourhood}\n${a.road}\n${a.house_number}\n${a.house}`;
  // } else {
  //   s = `${a.house}\n${a.house_number} ${a.road}\n${a.suburb || a.city_district || a.neighbourhood}\n${a.city || a.town || a.village} ${a.postcode}\n${a.country}`;
  // }
  // return s.replace(/\s+/, ' ').trim();
}

interface SearchResult {
  place_id: string,
  licence: string,
  osm_type: string,
  osm_id: string,
  boundingbox: string[],
  lat: string,
  lon: string,
  display_name: string,
  class: string,
  type: string,
  importance: number,
  address: {
    house_number?: string,
    road?: string,
    neighbourhood?: string,
    city?: string,
    county?: string,
    state?: string,
    postcode?: string,
    country?: string,
    country_code?: string,
    town?: string,
    village?: string,
    suburb?: string,
    city_district?: string,
    house?: string
  },
  namedetails: {
    name?: string
  }
}
//     "place_id": "60425600",
//     "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
//     "osm_type": "way",
//     "osm_id": "8789223",
//     "boundingbox": [
//         "41.6536931",
//         "41.6576125",
//         "-83.5513013",
//         "-83.5479658"
//     ],
//     "lat": "41.6550119",
//     "lon": "-83.550179",
//     "display_name": "19th Street, Uptown, Toledo, Lucas County, Ohio, 43624, United States of America",
//     "class": "highway",
//     "type": "residential",
//     "importance": 0.3,
//     "address": {
//         "road": "19th Street",
//         "neighbourhood": "Uptown",
//         "city": "Toledo",
//         "county": "Lucas County",
//         "state": "Ohio",
//         "postcode": "43624",
//         "country": "United States of America",
//         "country_code": "us"
//     },
//     "namedetails": {
//         "name": "19th Street"
//     }

// }