export const config = {
  chromeText: '#000',
  chromeBackground: '#fff',
  chromeHoverBackground: '#f5f5f5',
  chromeActiveBackground: '#eaeaea',
  chromeEmptyBackground: '#ddd',
  text: '#000',
  itemBackground: '#fff',
  itemText: '#000',
  disabledText: '#999',
};

type Config = typeof config;

let cssConfig: any = {...config};
Object.keys(cssConfig).forEach((key) => {
  cssConfig[key] = (props: any) => props.theme[key];
})

export let themed = cssConfig as Config;

// export function themed(field: keyof typeof config) {
//   return (props: any) => props.theme[field];
// }
