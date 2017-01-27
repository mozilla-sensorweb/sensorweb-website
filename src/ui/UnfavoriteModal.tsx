const { default: styled } = require<any>('styled-components');
import * as React from 'react';
import Modal from './Modal';
import Settings from '../state/Settings';
import Sensor from '../state/Sensor';


interface UnfavoriteModalProps {
  onClose(saved: boolean): void;
  settings: Settings;
  sensor: Sensor;
}


export default class UnfavoriteModal extends React.Component<UnfavoriteModalProps, any> {

  render() {
    const settings = this.props.settings;
    return (
      <Modal title="Unfavorite Sensor" onClose={this.cancel}
        buttons={[
          <button onClick={this.cancel}>Cancel</button>,
          <button onClick={this.save}>Remove</button>,
        ]}>
        <p>Would you like to remove this sensor from your list?</p>
      </Modal>
    );
  }

  save = () => {
    this.props.settings.unfavoriteSensor(this.props.sensor);
    this.props.onClose(true);
  }
  cancel = () => {
    this.props.onClose(false);
  }
}