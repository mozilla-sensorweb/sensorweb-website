import * as React from 'react';
const { default: styled } = require<any>('styled-components');
import { AppState, Location } from '../state';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';
import { themed } from './theme';

import { List, ListItem } from './lists';


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
    request.open('GET', `http://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(address)}`, true);
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
        name: result.display_name // XXX this is ugly
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
    return <Wrapper>
      <input
        type="text"
        ref={el => this.input = el}
        value={this.currentValue}
        placeholder="Enter Address"
        onKeyPress={(e) => e.key === 'Enter' && this.onEnter()}
        onChange={(e) => this.onChange(e.currentTarget.value)} />
      <List>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        <ListItem>Searching...</ListItem>
        {this.searching && <ListItem>Searching...</ListItem>}
        {this.suggestions && this.suggestions.map((suggestion, index) => (
          <ListItem key={index} onClick={() => this.selectSuggestion(suggestion)}>{suggestion.name}</ListItem>
        ))}
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


