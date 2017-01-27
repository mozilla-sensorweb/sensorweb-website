const { default: styled } = require<any>('styled-components');
import * as React from 'react';
import Modal from './Modal';
import Settings from '../state/Settings';
import Sensor from '../state/Sensor';


interface FavoriteModalProps {
  onClose(saved: boolean): void;
  settings: Settings;
  sensor: Sensor;
}


export default class FavoriteModal extends React.Component<FavoriteModalProps, any> {
  input: HTMLInputElement;

  componentDidMount() {
    this.input.focus();
  }

  render() {
    const settings = this.props.settings;
    return (
      <Modal title="Favorite Sensor" onClose={this.cancel}
        buttons={[
          <button onClick={this.cancel}>Cancel</button>,
          <button onClick={this.save}>Save</button>,
        ]}>
        <p>Enter a name for this sensor:</p>
        <p><input type="text" onKeyDown={(e) => e.key === 'Enter' && this.save()} ref={el => this.input = el} /></p>
      </Modal>
    );
  }

  cancel = () => {
    this.props.onClose(false);
  }

  save = () => {
    let name = this.input.value;
    if (!name) {
      name = 'Sensor';
    }
    this.props.settings.favoriteSensor(this.props.sensor, name);
    this.props.onClose(true);
  }
}
