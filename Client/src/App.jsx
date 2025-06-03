import { useState } from 'react';
import styled from 'styled-components';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import GlobalStyles from './styles/GlobalStyles';
import Silk from './components/ReactBits/Silk/Silk';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 2rem 10%;
  z-index: 1;
`

function App() {
  return (
    <>
      <GlobalStyles />
      <Silk
        speed={1}
        scale={1}
        color="#1a1b23"
        noiseIntensity={0.3}
        rotation={0}
      />
      <AppContainer>
        <Hero />
        <About />
        <Skills />
        <Projects />
      </AppContainer>
    </>
  )
}

export default App
