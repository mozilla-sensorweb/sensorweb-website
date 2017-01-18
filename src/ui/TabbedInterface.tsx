import * as React from 'react';
const { default: styled } = require<any>('styled-components');

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
              onClick={() => this.props.onSelectedTab(index)}>{label}</TabButton>
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
  height: 5rem;
`;

const Pane = styled.div`
  display: flex;
  position: relative;
  width: 100%;
`;

const TabButton = styled.div`
  height: 100%;

  flex-grow: 1;
  background: white;
  color: black;
  border-right: 1px solid #ccc;
  &:last-child { border-right: 0 none; }

  line-height: 5rem;
  text-align: center;
  flex-basis: 0;

  ${(props: any) => props.isCurrent ? `
    font-weight: bold;
  ` : `
    &:hover { background: #f5f5f5; }
    cursor: pointer;
  `}
`;
