import styled from 'styled-components'

const SkillsSection = styled.section`
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

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const SkillCategory = styled.div`
  margin-bottom: 2rem;
`

const CategoryTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
`

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`

const SkillBadge = styled.div`
  background-color: #1a1b23;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const Skills = () => {
  return (
    <SkillsSection>
      <SectionTitle>Skills</SectionTitle>
      <SkillsGrid>
        <SkillCategory>
          <CategoryTitle>Languages</CategoryTitle>
          <SkillsContainer>
            <SkillBadge>JS</SkillBadge>
            <SkillBadge>TS</SkillBadge>
          </SkillsContainer>
        </SkillCategory>

        <SkillCategory>
          <CategoryTitle>Frameworks & Libraries</CategoryTitle>
          <SkillsContainer>
            <SkillBadge>React.js</SkillBadge>
            <SkillBadge>MongoDB</SkillBadge>
          </SkillsContainer>
        </SkillCategory>

        <SkillCategory>
          <CategoryTitle>Tools</CategoryTitle>
          <SkillsContainer>
            <SkillBadge>Node.js</SkillBadge>
            <SkillBadge>TailIMmb-CSS</SkillBadge>
          </SkillsContainer>
        </SkillCategory>
      </SkillsGrid>
    </SkillsSection>
  )
}

export default Skills 