import * as React from 'react';
const { default: styled } = require<any>('styled-components');

interface ToastProps {

}


export default class Toast extends React.Component<ToastProps, any> {
  el: HTMLElement;

  componentWillEnter(callback: any) {
    console.log('aPPEAR')
    setTimeout(() => {
      this.el.classList.add('shown');
      callback();
    });
  }

  componentWillLeave(callback: any) {
    console.log('willleave')
    this.el.classList.remove('shown');
    setTimeout(callback, 1000);
  }
  render() {
    return (
      <ModalDiv innerRef={(el: any) => this.el = el}>
        {this.props.children}
      </ModalDiv>
    );
  }
};
const ModalDiv = styled.div`
  margin: 0 5%;
  max-height: 100%;
  width: 90%;

  opacity: 0;
  transition: opacity 800ms ease;
  &.shown {
    opacity: 1;
  }

  position: absolute;
  bottom: 13rem;

  background: white;
  color: black;
  text-align: center;
  font-size: larger;
  box-shadow: 0 0 4rem rgba(0, 0, 0, 0.4);

  padding: 1rem;
  z-index: 1000;
`;