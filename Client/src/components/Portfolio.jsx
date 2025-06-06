import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init("EwXOvx8aFyVkZMMZi"); // Your EmailJS public key

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 2rem 10%;
  z-index: 1;
`;

const HeroSection = styled.section`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #a1a1aa;
  font-weight: 400;
  margin-bottom: 2rem;
`;

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
`;

const AboutSection = styled.section`
  margin: 6rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #a1a1aa;
  max-width: 800px;
  line-height: 1.8;
`;

// Skills Section Styles
const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const SkillCategory = styled.div`
  margin-bottom: 2rem;
`;

const CategoryTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SkillBadge = styled.div`
  background-color: #1a1b23;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Projects Section Styles
const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProjectCard = styled.div`
  background-color: #1a1b23;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
`;

const ProjectDescription = styled.p`
  color: #a1a1aa;
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const TechStack = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const TechBadge = styled.div`
  background-color: #2a2b33;
  color: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

// Contact Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0; 
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1a1b23;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #a1a1aa;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #2a2b33;
  background-color: #2a2b33;
  color: #ffffff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3f3f46;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #2a2b33;
  background-color: #2a2b33;
  color: #ffffff;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3f3f46;
  }
`;

const SubmitButton = styled.button`
  background-color: #2a2b33;
  color: #ffffff;
  padding: 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #3f3f46;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #1f1f1f;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  text-align: center;
  background-color: ${props => 
    props.type === 'success' ? '#1a472a' : 
    props.type === 'error' ? '#5c1a1a' : '#2a2b33'};
  color: #ffffff;
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 27, 35, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 50px;
  display: flex;
  gap: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#ffffff' : '#71717a'};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const SocialIcon = styled.a`
  color: #a1a1aa;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #ffffff;
    transform: translateY(-2px);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  const handleConnect = (e) => {
    e.preventDefault();
    const subject = 'Portfolio Contact Request';
    const body = 'Hi Fayas,\n\nI would like to connect with you regarding...';
    window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=fayas.ofcl@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const projects = [
    {
      title: "Global Real Estates",
      description: "A advanced modern search, wixtistining, and property posting",
      tech: ["React", "Node.js", "MongoDB"]
    },
    {
      title: "OLX-Website",
      description: "A construct ads platform using user authentication using",
      tech: ["React", "Node.js"]
    },
    {
      title: "Blog Website (React)",
      description: "A responsive blog application built with React",
      tech: ["React", "TailwindCSS"]
    },
    {
      title: "Instagram Clone",
      description: "A responsive blog application, arouting state management, foruting",
      tech: ["React", "Redux"]
    }
  ];

  

  return (
    <AppContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <Title>Fayas Ismael</Title>
          <Subtitle>Junior Software Engineer | Full Stack Developer</Subtitle>
          <ConnectButton onClick={handleConnect}>
            Let's Connect
          </ConnectButton>
          <SocialLinks>
            <SocialIcon href="https://github.com/FAYASISMAEL" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://www.instagram.com/f_y_s_ismael/" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/fayas-ismael-a496b7270/" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </SocialIcon>
            <SocialIcon onClick={handleConnect} style={{ cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://x.com/FayaSIsmaeL22" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </SocialIcon>
          </SocialLinks>
        </HeroContent>
      </HeroSection>

      {/* About Section */}
      <AboutSection>
        <SectionTitle>About Me</SectionTitle>
        <Description>
          Passionate Software Engineer with full-stack web development experience in modern
          JavaScript frameworks like React.js and exploring UI/UX.
        </Description>
      </AboutSection>

      {/* Skills Section */}
      <AboutSection>
        <SectionTitle>Skills</SectionTitle>
        <SkillsGrid>
          <SkillCategory>
            <CategoryTitle>Languages</CategoryTitle>
            <SkillsContainer>
              <SkillBadge>HTML</SkillBadge>
              <SkillBadge>CSS</SkillBadge>
              <SkillBadge>JS</SkillBadge>
            </SkillsContainer>
          </SkillCategory>

          <SkillCategory>
            <CategoryTitle>Frameworks & Libraries</CategoryTitle>
            <SkillsContainer>
              <SkillBadge>React.JS</SkillBadge>
              <SkillBadge>Express.JS</SkillBadge>
              <SkillBadge>MongoDB</SkillBadge>
              <SkillBadge>AWS</SkillBadge>
              <SkillBadge>Git</SkillBadge>
            </SkillsContainer>
          </SkillCategory>

          <SkillCategory>
            <CategoryTitle>Tools</CategoryTitle>
            <SkillsContainer>
              <SkillBadge>Node.js</SkillBadge>
              <SkillBadge>Tailwind-CSS</SkillBadge>
              <SkillBadge>VSCode</SkillBadge>
              <SkillBadge>npm</SkillBadge>
            </SkillsContainer>
          </SkillCategory>
        </SkillsGrid>
      </AboutSection>

      {/* Projects Section */}
      <AboutSection>
        <SectionTitle>Projects</SectionTitle>
        <ProjectsGrid>
          {projects.map((project, index) => (
            <ProjectCard key={index}>
              <ProjectTitle>{project.title}</ProjectTitle>
              <ProjectDescription>{project.description}</ProjectDescription>
              <TechStack>
                {project.tech.map((tech, techIndex) => (
                  <TechBadge key={techIndex}>{tech}</TechBadge>
                ))}
              </TechStack>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      </AboutSection>

      {/* Bottom Navigation */}
      <BottomNav>
        <NavItem 
          $active={activeSection === 'home'} 
          onClick={() => setActiveSection('home')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </NavItem>
        <NavItem 
          $active={activeSection === 'projects'} 
          onClick={() => {
            setActiveSection('projects');
            navigate('/projects');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </NavItem>
        <NavItem 
          $active={activeSection === 'about'} 
          onClick={() => {
            setActiveSection('about');
            navigate('/about');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </NavItem>
        <NavItem 
          $active={activeSection === 'contact'} 
          onClick={handleConnect}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </NavItem>
      </BottomNav>
    </AppContainer>
  );
};

export default Portfolio; 