const { injectGlobal } = require<any>('styled-components');

// Our CSS includes a few global resets for ease of use:
// - "box-sizing: border-box" is default.
// - All margin and padding is removed from all elements.
// - All font size and weights are reset.
injectGlobal`

html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
  font-size: inherit;
	font-weight: inherit;
	font-style: normal;
}

html {
  font-family: Rubik, Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 1.4;
}

* {
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}


/* Hide the placeholder text when an input is focused. */
input:focus::-webkit-input-placeholder { color:transparent; }
input:focus::-moz-placeholder { color:transparent; } /* FF 19+ */
input:focus:-ms-input-placeholder { color:transparent; } /* IE 10+ */


body {
  background: #fff;
  position: fixed;
  width: 100%;
  height: 100%;
  -webkit-touch-callout: none;
  -webkit-text-size-adjust: none;
  user-select: none;
  overflow: hidden;
}



@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-Regular.ttf')}') format('truetype');
	font-weight: normal;
	font-style: normal;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-Light.ttf')}') format('truetype');
	font-weight: 300;
	font-style: normal;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-LightItalic.ttf')}') format('truetype');
	font-weight: 300;
	font-style: italic;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-Medium.ttf')}') format('truetype');
	font-weight: 500;
	font-style: normal;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-MediumItalic.ttf')}') format('truetype');
	font-weight: 500;
	font-style: italic;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-Bold.ttf')}') format('truetype');
	font-weight: 700;
	font-style: normal;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-BoldItalic.ttf')}') format('truetype');
	font-weight: 700;
	font-style: italic;
}

@font-face {
	font-family: 'Rubik';
	src: url('${require<string>('./assets/fonts/Rubik-Black.ttf')}') format('truetype');
	font-weight: 900;
	font-style: normal;
}

@font-face {
	font-family: 'Rubik';
	src: ${require<string>('./assets/fonts/Rubik-BlackItalic.ttf')}') format('truetype');
	font-weight: 900;
	font-style: italic;
}
`;