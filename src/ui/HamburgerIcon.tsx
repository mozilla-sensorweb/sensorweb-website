/**
 * Toggle Switch based on https://github.com/callmenick/Animating-Hamburger-Icons
 * MIT License, Copyright 2014 Call Me Nick
 */

import * as React from 'react';
const styled = require<any>('styled-components').default;

export default class HamburgerIcon extends React.Component<any, {}> {
  render() {
    return <HamburgerIconDiv className={this.props.drawerOpened ? 'is-active' : ''} {...this.props}>
      <span>toggle menu</span>
    </HamburgerIconDiv>;
  }
}
const HamburgerIconDiv = styled.div`
display: block;
position: relative;
overflow: hidden;
margin: 0;
padding: 0;
width: 48px;
height: 48px;
font-size: 0;
text-indent: -9999px;
-webkit-appearance: none;
-moz-appearance: none;
appearance: none;
box-shadow: none;
border-radius: none;
border: none;
cursor: pointer;
-webkit-transition: background 0.3s;
        transition: background 0.3s;
transform: scale(0.7);
z-index: 11000;
flex-shrink: 0;

&:focus {
  outline: none;
}

& span {
  display: block;
  position: absolute;
  top: 22px;
  left: 9px;
  right: 9px;
  height: 4px;
  background: black;
}

& span::before,
& span::after {
  position: absolute;
  display: block;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: black;
  content: "";
}

& span::before {
  top: -10px;
}

& span::after {
  bottom: -10px;
}


/**
 * Style 3
 *
 * Hamburger to left-arrow (htla). Hamburger menu transforms to a left-pointing
 * arrow. Usually indicates an off canvas menu sliding in from left that
 * will be close on re-click of the icon.
 */
& {

}

& span {
  -webkit-transition: -webkit-transform 0.3s;
          transition: transform 0.3s;
}

& span::before {
  -webkit-transform-origin: top right;
      -ms-transform-origin: top right;
          transform-origin: top right;
  -webkit-transition: -webkit-transform 0.3s, width 0.3s, top 0.3s;
          transition: transform 0.3s, width 0.3s, top 0.3s;
}

& span::after {
  -webkit-transform-origin: bottom right;
      -ms-transform-origin: bottom right;
          transform-origin: bottom right;
  -webkit-transition: -webkit-transform 0.3s, width 0.3s, bottom 0.3s;
          transition: transform 0.3s, width 0.3s, bottom 0.3s;
}

/* active state, i.e. menu open */
&.is-active {

}

&.is-active span {
  -webkit-transform: rotate(180deg);
      -ms-transform: rotate(180deg);
          transform: rotate(180deg);
}

&.is-active span::before,
&.is-active span::after {
  width: 50%;
}

&.is-active span::before {
  top: 0;
  -webkit-transform: translateX(19px) translateY(2px) rotate(45deg);
      -ms-transform: translateX(19px) translateY(2px) rotate(45deg);
          transform: translateX(19px) translateY(2px) rotate(45deg);
}

&.is-active span::after {
  bottom: 0;
  -webkit-transform: translateX(19px) translateY(-2px) rotate(-45deg);
      -ms-transform: translateX(19px) translateY(-2px) rotate(-45deg);
          transform: translateX(19px) translateY(-2px) rotate(-45deg);
}
`;