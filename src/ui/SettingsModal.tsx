import styled from 'styled-components';
import * as React from 'react';
import Modal from './Modal';
import Settings from '../state/Settings';
import { observer } from 'mobx-react';
import { themed } from './theme';

interface SettingsModalProps {
  onClose(): void;
  settings: Settings;
}

@observer
export default class SettingsModal extends React.Component<SettingsModalProps, any> {

  render() {
    const settings = this.props.settings;
    return (
      <Modal title="Settings" onClose={this.props.onClose}
        buttons={[
          <button onClick={this.props.onClose}>Done</button>,
        ]}>
        <p><label>Temperature Units:</label>
        <ToggleButtonBar value={settings.units} onChange={(e: any) => {
            settings.units = e.currentTarget.value;
          }}>
            <button value="metric">Celsius (°C)</button>
            <button value="imperial">Fahrenheit (°F)</button>
          </ToggleButtonBar>
        </p>
      </Modal>
    );
  }
}


interface ToggleButtonBarProps {
  value: string;
  onChange(e: Event): void;
}
const ToggleButtonBar = styled(observer(class extends React.Component<any, {}> {
  render() {
    return <div className={this.props.className}>
      {React.Children.map(this.props.children, (child: any) => {
        return React.cloneElement(child, {
          className: child.props.value === this.props.value ? 'selected' : '',
          onClick: (e: Event) => {
            this.props.onChange(e);
          }
        });
      })}
    </div>;
  }
}))`

  display: inline-block;

  & button {
    border-radius: 0;
    appearance: none;
    border: 1px solid #999;
    border-right-width: 0;
    background: #fff;
    padding: 0.5rem 1rem;
  }
  & button:hover {
    background: ${themed.chromeHoverBackground};
  }
  & button:active {
    background: ${themed.chromeActiveBackground};
  }
  & button:focus {
    outline: none;
  }
  & button:first-child {
    border-radius: 8px 0 0 8px;
  }
  & button:last-child {
    border-radius: 0 8px 8px 0;
    border-right-width: 1px;
  }

  & .selected {
    color: #06F;
  }

`
