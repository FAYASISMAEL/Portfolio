import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import About from './pages/About';
import Projects from './pages/Projects';
import GlobalStyles from './styles/GlobalStyles';
import ClickSpark from './ReactBits/ClickSpark/ClickSpark.jsx';
import LoadingAnimation from './components/LoadingAnimation';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  z-index: 1;
  background: linear-gradient(
    135deg,
    #0a0a0a 0%,
    #1a1a1a 25%,
    #141414 50%,
    #1a1a1a 75%,
    #0a0a0a 100%
  );
  background-size: 400% 400%;
  color: #ffffff;
`;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <GlobalStyles />
      {isLoading && <LoadingAnimation />}
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
