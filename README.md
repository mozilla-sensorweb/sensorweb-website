# 📱 SensorWeb Website

To develop:

1. `npm install`
2. `npm run dev` -- this launches a development server at <http://localhost:9000/webpack-dev-server/> which automatically builds and reloads. (Note: it says that it serves from `./dist`, but it does not.)

To make a production build:

1. `npm run prod` -- this puts a built static directory in `./dist`, which is directly uploaded to S3 to serve the site.

# Notes for Engineers

### Libraries

We use the following technologies:

- [TypeScript](https://www.typescriptlang.org) (v2.1)
- [React](https://facebook.github.io/react/) (for rendering the UI)
- [MobX](https://mobx.js.org) (for mapping the state to UI)
- [D3](https://d3js.org) (for graphs)
- [Webpack](https://webpack.js.org) for builds.

### Styles / CSS

Our CSS includes a few global resets for ease of use:

- "box-sizing: border-box" is default.
- All margin and padding is removed from all elements.
- All font size and weights are reset.

All styles are defined in the same file as their owning component, defined with [styled-components](https://styled-components.com). This allows us to avoid CSS rot.

### Assets / Images

Assets (images, etc.) are included in the `src/assets` folder and referenced by requiring them in modules like so:

```js
<img src={require<string>('./assets/foo.png')} />
```

Under the hood, Webpack copies that file to the output directory using an opaque name. Files which are not referenced are not included in the output; this avoids bundling unused files.

