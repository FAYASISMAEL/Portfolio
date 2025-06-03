import styled from 'styled-components'

const ProjectsSection = styled.section`
  margin: 6rem 0;
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const ProjectCard = styled.div`
  background-color: #1a1b23;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
`

const ProjectDescription = styled.p`
  color: #a1a1aa;
  margin-bottom: 1.5rem;
  font-size: 1rem;
`

const TechStack = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const TechBadge = styled.div`
  background-color: #2a2b33;
  color: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
`

const Projects = () => {
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
      title: "Blog Website (React)",
      description: "A responsive blog application, arouting state management, foruting",
      tech: ["React", "Redux"]
    }
  ]

  return (
    <ProjectsSection>
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
    </ProjectsSection>
  )
}

export default Projects 