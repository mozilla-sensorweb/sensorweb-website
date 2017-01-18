import * as React from 'react';
const { default: styled } = require<any>('styled-components');
import { AppState } from '../state';
import SearchBox, { SearchBoxProps } from './SearchBox';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

interface SearchPaneProps extends SearchBoxProps {
  appState: AppState;
}

@observer
export default class SearchPane extends React.Component<SearchPaneProps, {}> {
  @observable currentValue = '';
  input: HTMLInputElement;

  @action onChange(newValue: string) {
    this.currentValue = newValue;
  }

  @action onEnter() {
    let value = this.currentValue;
    this.currentValue = '';
    this.input.blur();
    this.props.onSearch(value);
  }

  render() {
    const appState = this.props.appState;
    return <Wrapper>
      <SearchBox {...this.props} />
    </Wrapper>;
  }
};


const Wrapper = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
`;
