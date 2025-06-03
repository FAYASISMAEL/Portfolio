import { useState } from 'react';
import styled from 'styled-components';

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

const Title = styled.h2`
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const Message = styled.div`
  padding: 0.8rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  
  ${({ type }) => type === 'success' && `
    background-color: #065f46;
    color: #ffffff;
  `}
  
  ${({ type }) => type === 'error' && `
    background-color: #7f1d1d;
    color: #ffffff;
  `}
`;

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', location: '', message: '' });
        setTimeout(() => onClose(), 2000);
      } else {
        // If server request fails, fall back to mailto
        const subject = `Portfolio Contact from ${formData.name}`;
        const body = `
Name: ${formData.name}
Email: ${formData.email}
Location: ${formData.location}

Message:
${formData.message}
        `;
        window.location.href = `mailto:fayas.ofcl@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setStatus({ type: 'info', message: 'Opening your email client...' });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again or use your email client.' 
      });
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Let's Connect</Title>
        
        {status && (
          <Message type={status.type}>
            {status.message}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="location"
            placeholder="Your Location"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <TextArea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </SubmitButton>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ContactModal; 