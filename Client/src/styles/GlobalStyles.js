import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    background-color: #0a0a0a;
  }

  body {
    color: #ffffff;
    line-height: 1.6;
    min-height: 100vh;
    position: relative;
  }

  #root {
    min-height: 100vh;
    position: relative;
    z-index: 1;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(26, 26, 26, 0.4) 0%,
      rgba(10, 10, 10, 0.8) 100%
    );
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
  }

  ::selection {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`

export default GlobalStyles;