import * as React from 'react';
const { default: styled } = require<any>('styled-components');

interface ModalProps {
  onClose(): void;
  title: string;
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
        <ModalDiv innerRef={(el: any) => this.el = el}>
          <div onClick={this.beginClose} style={{display: 'flex'}}>
            <img className="close-button" src={require<string>('../assets/close-icon.svg')} />
            <h1 style={{flexGrow: 1, alignSelf: 'center'}}>{this.props.title}</h1>
          </div>
          {this.props.children}
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
  z-index: 10001;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;

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
  }

  & .close-button {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
  }
`;