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
      <Modal title="Favorite Sensor" onClose={() => this.props.onClose(false)}>
        <SettingsDiv>
          <p>Enter a name for this sensor:</p>
          <p><input type="text" onKeyDown={(e) => e.key === 'Enter' && this.save()} ref={el => this.input = el} /></p>
          <p style={{textAlign: 'right'}}><button onClick={this.save}>Save</button></p>
        </SettingsDiv>
      </Modal>
    );
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

const SettingsDiv = styled.div`
  padding: 1rem;

  & select {
    margin-left: 1rem;
  }

  & p {
  }

  & input {
    width: 100%;
    padding: 0.5rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    border: 1px solid #ddd;
    border-radius: 3px;
    margin-top: 0.5rem;
    margin-bottom: 2rem;

    &:focus {
      box-shadow: 0 0 3px #169ED4;
    }
  }

  & button {
    padding: .5rem 2rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    font-size: larger;
    color: #169ED4;
    border: 1px solid #169ED4;
    border-radius: 3px;
    background: none;
  }

`