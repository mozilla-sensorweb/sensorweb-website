import * as React from 'react';
const { default: styled } = require<any>('styled-components');
import { themed } from './theme';

interface ModalProps {
  onClose(): void;
  title: string;
  buttons?: React.ReactElement<any>[];
}

const TRANSITION_TIME_MS = 200;

/**
 * The popup that shows the details of an individual sensor, including its graph, etc.
 */
export default class Modal extends React.Component<ModalProps, any> {
  el: HTMLElement;
  backdrop: HTMLElement;

  componentDidMount() {
    setTimeout(() => {
      this.backdrop.classList.add('loaded');
      this.el.classList.add('loaded');
    });
  }

  beginClose = () => {
    setTimeout(() => {
      this.props.onClose();
    }, TRANSITION_TIME_MS);
    this.backdrop.classList.add('closing');
    this.el.classList.add('closing');
  }

  render() {
    return (
      <ModalDivWrapper innerRef={(el: any) => this.backdrop = el} onClick={this.beginClose}>
        <ModalDiv innerRef={(el: any) => this.el = el} onClick={(e: any) => e.stopPropagation() }>
          <div style={{display: 'flex'}}>
            {/*<img onClick={this.beginClose} className="close-button" src={require<string>('../assets/close-icon.svg')} />*/}
            <h1 style={{flexGrow: 1, alignSelf: 'center'}}>{this.props.title}</h1>
          </div>
          {this.props.children}
          {this.props.buttons && <div className="buttons">{this.props.buttons}</div>}
        </ModalDiv>
      </ModalDivWrapper>
    );
  }
};

const ModalDivWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  display: flex;
  z-index: 11001;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;

  padding: 0.5rem;

  &.loaded {
    opacity: 1;
    transition: opacity ${TRANSITION_TIME_MS}ms ease-out;
  }

  &.closing {
    opacity: 0;
    transition: opacity ${TRANSITION_TIME_MS}ms ease-out;
  }
`;

const ModalDiv = styled.div`
  margin: auto;
  max-width: 30rem;
  max-height: 100%;
  width: 100%;

  background: white;
  color: black;
  opacity: 0;
  transform: scale(0.7);
  box-shadow: 0 0 4rem rgba(0, 0, 0, 0.4);
  border-radius: 10px;

  & .buttons {
    text-align: right;

    & button {
      margin-right: 1rem;
      padding: .5rem 2rem;
      -webkit-appearance: none;
      -moz-appearance: none;
      font-size: larger;
      color: #999;
      border: 2px solid #999;
      border-radius: 6px;
      background: none;
      &:hover { background: ${themed.chromeHoverBackground}; }
      &:active { background: ${themed.chromeActiveBackground}; }
      &:focus { outline: none; }
    }

    & > :last-child {
      color: #06F;
      border: 2px solid #06F;
      margin-right: 0;
    }
  }

  &.loaded {
    transform: scale(1);
    opacity: 1;
    transition: all ${TRANSITION_TIME_MS}ms ease-out;
  }

  &.closing {
    transform: scale(0.7);
    opacity: 0;
    transition: all ${TRANSITION_TIME_MS}ms ease-out;
  }

  & h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  & .close-button {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }


  padding: 1rem;

  & label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  & p {
    margin-bottom: 1rem;
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
      box-shadow: 0 0 3px #3863FF;
    }
  }
`;