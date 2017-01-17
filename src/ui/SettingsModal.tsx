const { default: styled } = require<any>('styled-components');
import * as React from 'react';
import Modal from './Modal';
import Settings from '../state/Settings';

interface SettingsModalProps {
  onClose(): void;
  settings: Settings;
}


export default class SettingsModal extends React.Component<SettingsModalProps, any> {

  render() {
    const settings = this.props.settings;
    return (
      <Modal title="Settings" onClose={this.props.onClose}>
        <SettingsDiv>
          <label>
            Temperature Units:
            <select value={settings.temperatureUnits}
               onChange={(e) => settings.temperatureUnits = e.currentTarget.value === 'c' ? 'c' : 'f'}>
              <option value="c">Celsius (°C)</option>
              <option value="f">Fahrenheit (°F)</option>
            </select>
          </label>
        </SettingsDiv>
      </Modal>
    );
  }
}

const SettingsDiv = styled.div`
  padding: 1rem;

  & select {
    margin-left: 1rem;
  }
`