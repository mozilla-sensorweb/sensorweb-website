import * as React from 'react';
const { default: styled, css } = require<any>('styled-components');
import { themed } from './theme';


export const List = styled.ul`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  flex-basis: 0;
  overflow-y: auto;

  background: ${themed.chromeEmptyBackground};

`;

export const ListItem = styled.li`
  padding: 1rem;
  background: ${themed.itemBackground};
  border-bottom: 1px solid #ddd;
  color: ${themed.itemText};

  ${(props: any) => props.onClick && css`
    cursor: pointer;
    &:hover {
      background: ${themed.chromeHoverBackground};
    }
    &:active {
      background: ${themed.chromeActiveBackground};
    }
  `}
`;

export const Card = styled(ListItem)`
  margin: 1rem;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
`;

export const EmptyListItem = styled.li`
  padding: 1rem;
  color: #bbb;
  font-size: larger;
  text-align: center;
  margin-top: 2rem;
`;