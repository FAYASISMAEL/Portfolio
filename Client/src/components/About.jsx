import styled from 'styled-components'

const AboutSection = styled.section`
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

const Description = styled.p`
  font-size: 1.1rem;
  color: #a1a1aa;
  max-width: 800px;
  line-height: 1.8;
`

const About = () => {
  return (
    <AboutSection>
      <SectionTitle>About Me</SectionTitle>
      <Description>
        Passionate Software Engineer with full-stack web development experience in modern
        JavaScript frameworks like React.js and exploring UI/UX.
      </Description>
    </AboutSection>
  )
}

export default About 