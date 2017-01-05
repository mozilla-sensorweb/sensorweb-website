import * as React from 'react';

const { default: styled } = require<any>('styled-components');

export default styled((props: any) =>
  <div className={props.className}>
    <h1>SensorWeb</h1>
    <div className="links">
      <a href="#">Contribute!</a>
      <a href="#">Help</a>
      <a href="#">Sign in / Join</a>
    </div>
</div>)`
  background: white;
  color: #169ED4;
  padding: 0.5rem 1rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  & h1 {
    line-height: 1;
    font-size: 1.3rem;
    font-weight: normal;
    margin: 0;
  }

  & .links {
    & a {
      display: inline-block;
      padding: 0 0.5rem;
      border-right: 1px solid #999;
      color: #999;
      font-size: smaller;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    & a:last-child {
      border-right: 0px none;
      margin-right: -0.5rem;
    }
  }
`;