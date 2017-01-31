import * as React from 'react';
import styled from 'styled-components';

export enum Icon {
  FavoriteTab,
  MapTab,
  SearchTab,
  Edit,
  Share,
  Settings,
  Menu,
  Close,
  Collapse,
  Favorited,
  Save,
  Empty2
};

interface SpriteIconProps {
  title?: string;
  icon: Icon;
  className?: string;
  ["data-morph-key"]?: string;
  selected?: boolean;
  onClick?(): void;
}

export default styled((props: SpriteIconProps) => {
  return <div title={props.title}
    data-morph-key={props['data-morph-key']}
    className={props.className} style={{
    backgroundPositionX: (props.icon * -100) + '%',
    backgroundPositionY: (props.selected ? -100 : 0) + '%',
  }} onClick={props.onClick}>{props.title}</div>;
})`
  display: inline-block;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
  width: 3rem;
  height: 3rem;
  background: url('${require<string>('../assets/tab-sprites.svg')}') 0 0;
  background-size: calc(12 * 100%) calc(2 * 100%);
`;