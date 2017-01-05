import * as React from 'react';
import { getColorArray } from './colorScale';
const styled = require<any>('styled-components').default;

interface ColorIndexOverlayProps {
  //theme: 'light' | 'dark';
}

const Bars = styled.div`
  display: flex;
`;

const ColorBar = styled.div`
  height: 1rem;
  width: calc(10% - 1px);
  margin: 0.5px;
  box-sizing: border-box;
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const Labels = styled.div`
  display: flex;
  margin-top: 0.5rem;
  position: relative;
  left: 2px;
`;

const Label = styled.div`
  text-align: center;
  font-weight: 400;
  font-size: 0.7rem;
  box-sizing: border-box;
  border-right: 2px dotted #999;
  width: calc(30%);
  line-height: 1;
  &:last-child {
    border-right-color: transparent;
  }
  &:nth-child(2) {
    width: calc(40%);
  }
`;


export default styled(class ColorIndexOverlay extends React.Component<any, {}> {
  render() {
    const colors = getColorArray('light');
    const colorBars = colors.map((c, index) => {
      return <ColorBar key={index} style={{backgroundColor: c}} />
    });
    return (
      <div className={this.props.className}>
        {/*<div>PM 2.5 Index</div>*/}
        <Bars>
          {colorBars}
        </Bars>
        <Labels>
          <Label style={{ color: colors[2] }}>Low</Label>
          <Label style={{ width: 'calc(40%)', color: colors[5] }}>Moderate</Label>
          <Label style={{ borderRightColor: 'transparent', color: colors[8] }}>High</Label>
        </Labels>
      </div>
    )
  }
})`
  position: absolute;
  z-index: 2;
  bottom: 30px;
  left: 10px;
  background: white;
  border-radius: 4px;
  color: #333;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  width: 14rem;
  padding: 0.5rem;
`;
