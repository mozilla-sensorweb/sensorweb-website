import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
const { default: styled } = require<any>('styled-components');

import SearchBox, { SearchBoxProps } from './SearchBox';

interface MobileHeaderProps extends SearchBoxProps {
  onSearch(address: string): void;
  onOpenDrawer(): void;
  searching?: boolean;
}

@observer
export default class MobileHeader extends React.Component<MobileHeaderProps, {}> {
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
    return <MobileHeaderDiv>
      <img className="menu" src={require<string>('../assets/menu-icon.svg')}
        onClick={this.props.onOpenDrawer} />
      <SearchBox {...this.props} />
      <img className="settings" src={require<string>('../assets/settings-icon.svg')} />
    </MobileHeaderDiv>;
  }
}

const MobileHeaderDiv = styled.div`
  display: flex;
  flex-direction: row;
  background: white;

  & .menu, & .settings {
    width: 3rem;
    height: 3rem;
  }
`;