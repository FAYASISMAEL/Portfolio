import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 10%;
  position: relative;
`;

const BackButton = styled.button`
  position: fixed;
  top: 2rem;
  left: 2rem;
  background: rgba(26, 27, 35, 0.8);
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

const ContentSection = styled.section`
  margin: 4rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled.div`
  background-color: rgba(26, 27, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
`;

const CardContent = styled.p`
  color: #a1a1aa;
  line-height: 1.6;
`;

const TimelineSection = styled.div`
  position: relative;
  padding-left: 2rem;
  margin-top: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #ffffff, #a1a1aa);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 2rem;
  padding-left: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    left: -2.1rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    background-color: #ffffff;
    border-radius: 50%;
  }
`;

const TimelineDate = styled.span`
  display: block;
  font-size: 0.9rem;
  color: #a1a1aa;
  margin-bottom: 0.5rem;
`;

const AboutHeroSection = styled.div`
  margin: 2rem 0 4rem 0;
  max-width: 900px;
`;

const AboutText = styled.div`
  font-size: 1.2rem;
  line-height: 1.8;
  color: #a1a1aa;
  
  p {
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  strong {
    color: #ffffff;
    font-weight: 500;
  }
`;

const Highlight = styled.span`
  color: #ffffff;
  background: linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
`;

const About = () => {
  const navigate = useNavigate();

  return (
    <AboutContainer>
      <BackButton onClick={() => navigate('/')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </BackButton>

      <ContentSection>
        <SectionTitle>About Me</SectionTitle>
        <AboutHeroSection>
          <AboutText>
            <p>
              Hi, I'm <Highlight>Fayas Ismael</Highlight> — a passionate Junior Software Engineer and Full Stack Developer with a solid foundation in building scalable, responsive, and user-friendly web applications. I enjoy transforming ideas into real-world digital products using clean, efficient, and maintainable code.
            </p>
            <p>
              I specialize in the <Highlight>MERN stack</Highlight> (MongoDB, Express.js, React.js, Node.js) and have hands-on experience working on various real-time projects like:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>E-commerce platforms</li>
              <li>Blog systems</li>
              <li>Real estate listings</li>
              <li>Booking applications</li>
            </ul>
            <p>
              I'm always eager to learn new technologies and continuously improve my skill set to stay current with industry trends. Whether it's designing smooth user interfaces with React or building robust backend APIs with Node.js and MongoDB, I aim to create impactful digital experiences that solve real problems.
            </p>
          </AboutText>
        </AboutHeroSection>

        <Grid>
          <Card>
            <CardTitle>Background</CardTitle>
            <CardContent>
              I am a passionate Software Engineer with a deep love for creating innovative web solutions.
              My journey in tech began with curiosity and has evolved into a professional career
              focused on building exceptional user experiences.
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Philosophy</CardTitle>
            <CardContent>
              I believe in writing clean, maintainable code and creating intuitive user interfaces.
              My approach combines technical expertise with creative problem-solving to deliver
              solutions that make a real impact.
            </CardContent>
          </Card>
        </Grid>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Experience</SectionTitle>
        <TimelineSection>
          <TimelineItem>
            <TimelineDate>2024 - Present</TimelineDate>
            <CardTitle>Junior Software Engineer</CardTitle>
            <CardContent>
              Leading development of modern web applications using React and Node.js.
              Implementing best practices and mentoring junior developers.
            </CardContent>
          </TimelineItem>
        </TimelineSection>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Interests</SectionTitle>
        <Grid>
          <Card>
            <CardTitle>Technology</CardTitle>
            <CardContent>
              Passionate about emerging web technologies, AI, and creating intuitive user interfaces.
              Always exploring new tools and frameworks to enhance development workflow.
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Open Source</CardTitle>
            <CardContent>
              Active contributor to open-source projects. Believe in the power of community-driven
              development and knowledge sharing.
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Learning</CardTitle>
            <CardContent>
              Continuous learner, always staying updated with the latest industry trends and best practices.
              Enjoy sharing knowledge through mentoring and tech talks.
            </CardContent>
          </Card>
        </Grid>
      </ContentSection>
    </AboutContainer>
  );
};

export default About; 