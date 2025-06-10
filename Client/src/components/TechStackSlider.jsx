import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideAnimation = keyframes`
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-50%);
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  overflow: hidden;
  background: rgba(26, 27, 35, 0.6);
  padding: 2rem 0;
  margin: 3rem 0;
`;

const SliderTrack = styled.div`
  display: flex;
  animation: ${slideAnimation} 30s linear infinite;
  white-space: nowrap;
  gap: 3rem;
`;

const SliderContent = styled.div`
  display: flex;
  gap: 3rem;
  padding: 0 1.5rem;
`;

const TechItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.9;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const TechStackSlider = () => {
  const techStack = {
    languages: ['JavaScript', 'TypeScript', 'Python', 'HTML5', 'CSS3', 'SQL'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Django', 'TailwindCSS'],
    tools: ['Git', 'VS Code', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Figma', 'Webpack']
  };

  const allTech = [
    ...techStack.languages.map(tech => ({ name: tech})),
    ...techStack.frameworks.map(tech => ({ name: tech})),
    ...techStack.tools.map(tech => ({ name: tech }))
  ];

  const duplicatedTech = [...allTech, ...allTech];

  return (
    <SliderContainer>
      <SliderTrack>
        <SliderContent>
          {duplicatedTech.map((tech, index) => (
            <TechItem key={`${tech.name}-${index}`}>
              <span>{tech.name}</span>
              <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                {tech.category}
              </span>
            </TechItem>
          ))}
        </SliderContent>
      </SliderTrack>
    </SliderContainer>
  );
};

export default TechStackSlider; 