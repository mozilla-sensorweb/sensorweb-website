import * as React from 'react';
import { getColorArray } from './colorScale';

interface ColorIndexOverlayProps {
  //theme: 'light' | 'dark';
}
export default class ColorIndexOverlay extends React.Component<{}, {}> {
  render() {
    const colors = getColorArray('light');
    const colorBars = colors.map((c, index) => {
      return <div key={index} className="ColorIndexOverlay__color" style={{backgroundColor: c}}></div>
    });
    return (
      <div className="ColorIndexOverlay">
        {/*<div>PM 2.5 Index</div>*/}
        <div className="ColorIndexOverlay__bar">
          {colorBars}
        </div>
        <div className="ColorIndexOverlay__labels">
          <div className="ColorIndexOverlay__low"
            style={{ color: colors[2] }}>Low</div>
          <div className="ColorIndexOverlay__moderate"
            style={{ color: colors[5] }}>Moderate</div>
          <div className="ColorIndexOverlay__high"
            style={{ color: colors[8] }}>High</div>
        </div>
      </div>
    )
  }
}