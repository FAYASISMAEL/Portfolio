import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideAnimation = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
`;

const SliderContainer = styled.div`
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(26, 27, 35, 0.9) 0%, rgba(26, 27, 35, 0.6) 50%, rgba(26, 27, 35, 0.9) 100%);
  padding: 2rem 0;
  margin: 3rem 0;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 200px;
    height: 100%;
    z-index: 2;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, rgba(13, 13, 13, 1), transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, rgba(13, 13, 13, 1), transparent);
  }
`;

const SliderTrack = styled.div`
  display: flex;
  width: fit-content;
  animation: ${slideAnimation} 20s linear infinite;
  will-change: transform;

  &:hover {
    animation-play-state: paused;
  }
`;

const SliderContent = styled.div`
  display: flex;
  gap: 4rem;
  padding: 0 2rem;
  flex-shrink: 0;
`;

const TechItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  white-space: nowrap;

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

const TechStackSlider = () => {
  const techStack = {
    languages: [
      'HTML', 'CSS', 'JavaScript'
    ],
    frameworks: [
      'React.JS', 'Node.JS', 'Express.JS', 'TailwindCSS'
    ],
    tools: [
      'Git', 'GitHub', 'VS Code', 'AWS', 'MongoDB'
    ]
  };

  const allTech = [
    ...techStack.languages.map(tech => ({ name: tech })),
    ...techStack.frameworks.map(tech => ({ name: tech })),
    ...techStack.tools.map(tech => ({ name: tech }))
  ];

  return (
    <SliderContainer>
      <SliderTrack>
        <SliderContent>
          {allTech.map((tech, index) => (
            <TechItem key={`${tech.name}-${index}-1`}>
              <span>{tech.name}</span>
            </TechItem>
          ))}
        </SliderContent>
        <SliderContent>
          {allTech.map((tech, index) => (
            <TechItem key={`${tech.name}-${index}-2`}>
              <span>{tech.name}</span>
            </TechItem>
          ))}
        </SliderContent>
      </SliderTrack>
    </SliderContainer>
  );
};

export default TechStackSlider; 