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
  }

  body {
    background-color: #0f0f0f;
    color: #ffffff;
    line-height: 1.6;
    min-height: 100vh;
    position: relative;
  }

  #root {
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
  }
`

export default GlobalStyles;