import * as React from 'react';
const { default: styled, css } = require<any>('styled-components');
import { themed } from './theme';

import SpriteIcon, { Icon } from './SpriteIcon';

interface TabbedInterfaceProps {
  selectedTab: number;
  labels: any[];
  onSelectedTab(index: number): void;
}

/**
 * The popup that shows the details of an individual sensor, including its graph, etc.
 */
export default class TabbedInterface extends React.Component<TabbedInterfaceProps, any> {

  render() {
    const currentPaneIndex = this.props.selectedTab;
    const count = React.Children.count(this.props.children);
    return (
      <Wrapper>
        <Panes style={{width: `${count * 100}%`, transform: `translateX(-${currentPaneIndex / count * 100}%)`}}>
          {React.Children.map(this.props.children, (child) => (
            <Pane>{child}</Pane>
          ))}
        </Panes>
        <Buttons>
          {this.props.labels.map((label, index) => (
            <TabButton
              isCurrent={currentPaneIndex === index}
              onClick={() => this.props.onSelectedTab(index)}>
              <SpriteIcon icon={index} title={label} selected={currentPaneIndex === index} />
            </TabButton>
          ))}
        </Buttons>
      </Wrapper>
    );
  }
};

const Wrapper = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
`;

const Panes = styled.div`
  flex-grow: 1;
  display: flex;
`;

const Buttons = styled.div`
  flex-shrink: 0;

  display: flex;
  height: 4rem;
  box-shadow: 0 0px 30px rgba(0, 0, 0, 0.3);
  padding-left: 20px;
  padding-right: 20px;
  margin-left: -20px;
  margin-right: -20px;
  z-index: 1;

  justify-content: center;
  background: ${themed.chromeBackground};
`;

const Pane = styled.div`
  display: flex;
  position: relative;
  width: 100%;
`;

const TabButton = styled.div`
  height: 100%;

  flex-grow: 1;
  background: ${themed.chromeBackground};
  color: ${themed.chromeText};
  border-right: 1px solid #ccc;
  &:last-child { border-right: 0 none; }

  line-height: 4rem;
  text-align: center;
  flex-basis: 0;
  max-width: 20rem;

  display: flex;

  & > div {
    margin: auto;
  }

  ${(props: any) => props.isCurrent ? `
    font-weight: bold;
  ` : css`
    &:hover { background: ${themed.chromeHoverBackground}; }
    &:active {
      background: ${themed.chromeActiveBackground};
    }
    cursor: pointer;
  `}
`;
