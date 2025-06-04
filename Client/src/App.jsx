import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import About from './pages/About';
import Projects from './pages/Projects';
import GlobalStyles from './styles/GlobalStyles';
import ClickSpark from './ReactBits/ClickSpark/ClickSpark.jsx';
import Lightning from './ReactBits/Lightning/Lightning.jsx';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  z-index: 1;
`;

function App() {
  return (
    <Router>
      <GlobalStyles />
      <Lightning
        hue={220}
        xOffset={0.2}
        speed={0.5}
        intensity={1.5}
        size={2}
      />
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <AppContainer>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </AppContainer>
      </ClickSpark>
    </Router>
  )
}

export default App
