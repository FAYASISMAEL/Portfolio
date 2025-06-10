import { useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ClickSpark from '../ReactBits/ClickSpark/ClickSpark';

import realEstateImg from '../assets/real-estate.png';
import Newspaper from '../assets/newspaper.jpg';
import Instagram from '../assets/instagram.jpg';
import Ecommerce from '../assets/ecomerce.jpg';
import Olx from '../assets/OLX.png';

const ProjectsContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 10%;
  position: relative;
  z-index: 1;
  background: transparent;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, #ffffff03 0, #ffffff00 100%);
    pointer-events: none;
  }
`;

const BackButton = styled.button`
  position: fixed;
  top: 2rem;
  left: 2rem;
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(10px);
  border: none;
  color: #ffffff;
  padding: 0.8rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  z-index: 10;

  &:hover {
    transform: translateX(-5px);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const GridBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 35px 35px;
  pointer-events: none;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProjectCard = styled.div`
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    pointer-events: none;
  }
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
`;

const ProjectDescription = styled.p`
  color: #a1a1aa;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const TechBadge = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const ProjectLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform with user authentication, product management, and secure payment integration.",
    image: Ecommerce,
    tech: ["React", "Node.JS", "MongoDB", "Express"],
    color: '#5196fd',
    githubUrl: "https://github.com/example"
  },
  {
    id: 2,
    title: "Instagram Clone",
    description: "This Instagram Clone is a fully functional, visually inspired replica of the popular social media platform Instagram. It recreates core features such as user authentication, image sharing, liking posts, and viewing user profiles.",
    image: Instagram,
    tech: ["React", "Node.JS", "MongoDB"],
    color: '#8f89ff',
    githubUrl: "https://github.com/example"
  },
  {
    id: 3,
    title: "Real Estate Listings",
    description: "Property listing platform with search, filter, and booking functionality.",
    image: realEstateImg,
    tech: ["React", "Node.JS", "MongoDB"],
    color: '#13006c',
    githubUrl: "https://github.com/FAYASISMAEL/Global-Real-Estates/tree/master"
  },
  {
    id: 4,
    title: "NewsPaper Website",
    description: "NewPaper is a clean and modern news portal website built to deliver dynamic and visually appealing news content. Designed with responsiveness and user experience in mind.",
    image: Newspaper,
    tech: ["HTML", "CSS"],
    color: '#ed649e',
    githubUrl: "https://github.com/FAYASISMAEL/NewPaper-website/tree/main"
  },
  {
    id: 5,
    title: "Olx Clone",
    description: "This OLX Clone is a full-stack web application that replicates the core functionalities of the popular OLX platform, allowing users to buy, sell, and explore products across various categories.",
    image: Olx,
    tech: ["React", "Node.JS", "MongoDB"],
    color: '#fd521a',
    githubUrl: "https://github.com/FAYASISMAEL/Olx-clone-Website"
  }
];

const Projects = () => {
  const navigate = useNavigate();

  return (
    <ClickSpark>
      <ProjectsContainer>
        <BackButton onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </BackButton>
        <ContentWrapper>
          <SectionTitle>My Projects</SectionTitle>
          <ProjectGrid>
            {projects.map((project) => (
              <ProjectCard key={project.id}>
                <ProjectImage>
                  <img src={project.image} alt={project.title} />
                </ProjectImage>
                <ProjectContent>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <ProjectDescription>{project.description}</ProjectDescription>
                  <TechStack>
                    {project.tech.map((tech, index) => (
                      <TechBadge key={index}>{tech}</TechBadge>
                    ))}
                  </TechStack>
                  <ProjectLinks>
                    <ProjectLink href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </ProjectLink>
                  </ProjectLinks>
                </ProjectContent>
              </ProjectCard>
            ))}
          </ProjectGrid>
        </ContentWrapper>
      </ProjectsContainer>
    </ClickSpark>
  );
};

export default Projects; 