const { default: styled } = require<any>('styled-components');
import * as React from 'react';
import Modal from './Modal';

interface SettingsModalProps {
  onClose(): void;
}

export default class SettingsModal extends React.Component<SettingsModalProps, any> {
  render() {
    return (
      <Modal title="Settings" onClose={this.props.onClose}>
      </Modal>
    );
  }
}