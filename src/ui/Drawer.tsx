import * as React from 'react';
const styled = require<any>('styled-components').default;

interface DrawerProps {
  open: boolean;
  onClose: Function;
  contents: any;
}

const TRANSITION_TIME_MS = 200;
const WIDTH = '260px'; // Make sure this is smaller than the screen! Or we could do more dynamic stuff.

// TODO: Enable touch dragging to close.
export default class Drawer extends React.Component<DrawerProps, {}> {
  render() {
    return (
      <DrawerWrapper>
        <DrawerDiv open={this.props.open}>
          {this.props.contents}
        </DrawerDiv>
        <ContentsDiv open={this.props.open}>
          {this.props.children}
        </ContentsDiv>
        <Overlay open={this.props.open} onClick={this.props.onClose} />
      </DrawerWrapper>
    );
  }
}

const DrawerWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const DrawerDiv = styled.div`
  position: fixed;
  top: 0;
  left: -${WIDTH};
  width: ${WIDTH};
  height: 100vh;
  z-index: 10000;
  background: white;
  transform: translateX(${(props: any) => props.open ? WIDTH : '0'});

  transition: all ${TRANSITION_TIME_MS}ms ease-out;
  box-shadow: ${(props: any) => props.open ? '1rem 0 2rem rgba(0, 0, 0, 0.3)' : 'none'};

  & h1 {
    font-size: 1.5rem;
  }

  padding: 1rem;
`;

const ContentsDiv = styled.div`
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all ${TRANSITION_TIME_MS}ms ease-out;
  opacity: ${(props: any) => props.open ? '0.3' : '0'};
  pointer-events: ${(props: any) => props.open ? 'all' : 'none'};
  z-index: 9999;
  background: black;
`;