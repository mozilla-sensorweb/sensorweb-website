import * as d3 from 'd3';

export const pmToIndex = d3.scaleThreshold()
  .domain([12, 24, 36, 42, 48, 54, 59, 65, 71])
  .range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

// http://taqm.epa.gov.tw/taqm/tw/fpmi.htm

const VALUE_COLORS_LIGHT_BG = [
  '#15DC00', '#10B60E', '#0B8F1A', '#C3CA00', '#F8BC48',
  '#EB812A', '#ED6262', '#ED2000', '#C51840', '#D00DF8'
];

const VALUE_COLORS_DARK_BG = [
  '#78E15F', '#6FBB4C', '#12A249', '#F1EB44', '#F8BC48',
  '#FA9138', '#F35151', '#FA222F', '#D11B03', '#DC31FD'
];

export function getColorArray(theme: 'light'|'dark') {
  return theme === 'light' ? VALUE_COLORS_LIGHT_BG : VALUE_COLORS_DARK_BG;
}

export function pmToColor(pm?: number) {
  const colors = getColorArray('light');
  if (pm === undefined) {
    return '#999';
  }
  return colors[pmToIndex(pm)];
}

let interpolator = d3.interpolateRgbBasis(VALUE_COLORS_LIGHT_BG);
export function pmToGradientColor(pm: number) {
  return interpolator(pm / 70);
}