import React from 'react';
import styled from 'styled-components';
import { Container, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, #182038 0%, #2A3352 100%);
  position: relative;
  overflow: hidden;
  color: white;
`;

const GlowEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, ${props => props.theme.colors.primary.main} 0%, transparent 70%);
  transform: translate(-50%, -50%);
  opacity: 0.1;
  filter: blur(100px);
  z-index: 1;
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const Title = styled(Typography)`
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }

  span {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ButtonGroup = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const SocialLinks = styled(Box)`
  margin-top: 3rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  
  a {
    color: white;
    opacity: 0.8;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8
    }
  }
};

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SectionContainer>
      <GlowEffect
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <Content maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Title variant="h2">
            Rejoignez la Révolution <span>TokenForge</span>
          </Title>
          
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
            Créez votre token dès aujourd'hui et participez à l'avenir de la finance décentralisée
          </Typography>

          <ButtonGroup>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/create')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#FF8C00',
                '&:hover': {
                  bgcolor: '#E67E00'
                }
              }}
            >
              Créer Mon Token
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.open('https://discord.gg/tokenforge', '_blank')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: '#FF8C00',
                  color: '#FF8C00'
                }
              }}
            >
              Rejoindre la Communauté
            </Button>
          </ButtonGroup>

          <SocialLinks>
            <a href="https://twitter.com/tokenforge" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="https://t.me/tokenforge" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            <a href="https://discord.gg/tokenforge" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
            <a href="https://medium.com/tokenforge" target="_blank" rel="noopener noreferrer">
              Medium
            </a>
          </SocialLinks>
        </motion.div>
      </Content>
    </SectionContainer>
  );
}; 