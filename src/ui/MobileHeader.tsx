import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
const { default: styled } = require<any>('styled-components');

import SearchBox, { SearchBoxProps } from './SearchBox';
import HamburgerIcon from './HamburgerIcon';

interface MobileHeaderProps extends SearchBoxProps {
  onSearch(address: string): void;
  onToggleDrawer(): void;
  onOpenSettings(): void;
  searching?: boolean;
  drawerOpened?: boolean;
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
      <HamburgerIcon drawerOpened={this.props.drawerOpened} onClick={this.props.onToggleDrawer} />
      <SearchBox {...this.props} />
      <img className="settings" src={require<string>('../assets/settings-icon.svg')}
        onClick={this.props.onOpenSettings} />
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