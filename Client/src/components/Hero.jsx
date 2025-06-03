import { useState } from 'react';
import styled from 'styled-components'
import ContactModal from './ContactModal';

const HeroSection = styled.section`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #a1a1aa;
  font-weight: 400;
  margin-bottom: 2rem;
`

const ConnectButton = styled.button`
  background-color: #1a1b23;
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  width: fit-content;

  &:hover {
    background-color: #2a2b33;
    transform: translateY(-2px);
  }
`

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <HeroSection>
      <Title>Fayas Ismael</Title>
      <Subtitle>Junior Software Engineer | Full Stack Developer</Subtitle>
      <ConnectButton onClick={() => setIsModalOpen(true)}>
        Let's Connect
      </ConnectButton>
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </HeroSection>
  )
}

export default Hero 