import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
const { default: styled } = require<any>('styled-components')

export interface SearchBoxProps {
  onSearch(address: string): void;
  searching?: boolean;
}

/**
 * The box you type an address into. It knows nothing about what happens to the address.
 */
@observer
export default class SearchBox extends React.Component<SearchBoxProps, {}> {
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
    return <SearchBoxDiv>
      <input
        type="text"
        ref={el => this.input = el}
        value={this.props.searching ? 'Searching... ' : this.currentValue}
        disabled={this.props.searching}
        placeholder="Enter Address"
        onKeyPress={(e) => e.key === 'Enter' && this.onEnter()}
        onChange={(e) => this.onChange(e.currentTarget.value)} />
    </SearchBoxDiv>;
  }
}

const SearchBoxDiv = styled.div`
  width: 100%;
  display: flex;

  & input {
    font-size: 1.3rem;
    padding: .5rem;
    width: 100%;
    font-family: inherit;
    border: 0px none;
    -webkit-appearance: none; /* no inset shadow */

    &[disabled] {
      color: #aaa;
      opacity: 1;
    }
  }
`;