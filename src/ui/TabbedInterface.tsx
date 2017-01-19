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
              onClick={() => this.props.onSelectedTab(index)}>
                <span style={{
                  backgroundPositionX: (index * -100) + '%',
                  backgroundPositionY: (currentPaneIndex === index ? -100 : 0) + '%',
                }}>{label}</span></TabButton>
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

  line-height: 4rem;
  text-align: center;
  flex-basis: 0;


  display: flex;

  & span {
    text-indent: 100%;
    white-space: nowrap;
    overflow: hidden;
    width: 3rem;
    height: 3rem;
    margin: auto;
    background: url('${require<string>('../assets/tab-sprites.svg')}') 0 0;
    background-size: calc(3 * 100%) calc(2 * 100%);
  }

  ${(props: any) => props.isCurrent ? `
    font-weight: bold;
  ` : `
    &:hover { background: #f5f5f5; }
    cursor: pointer;
  `}
`;
