import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  body {
    background-color: #0a0b0f;
    color: #ffffff;
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }

  p {
    margin-bottom: 1rem;
    color: #a1a1aa;
  }

  section {
    margin: 4rem 0;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }
`

export default GlobalStyles 