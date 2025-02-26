import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const StyledSection = styled('section')(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Les avantages de la tokenisation d\'actifs',
    description: 'Découvrez comment la tokenisation transforme le marché des actifs traditionnels en les rendant plus accessibles et liquides.',
    image: '/images/blog/tokenization.jpg',
    date: '2024-03-15',
    category: 'Tokenisation'
  },
  {
    id: '2',
    title: 'Guide du lancement de token réussi',
    description: 'Les étapes essentielles pour lancer votre token avec succès, de la conception à la distribution.',
    image: '/images/blog/token-launch.jpg',
    date: '2024-03-10',
    category: 'Guide'
  },
  {
    id: '3',
    title: 'Sécurité des smart contracts',
    description: 'Les meilleures pratiques pour sécuriser vos smart contracts et protéger les investisseurs.',
    image: '/images/blog/security.jpg',
    date: '2024-03-05',
    category: 'Sécurité'
  },
  {
    id: '4',
    title: 'L\'évolution des standards de tokens',
    description: 'Une analyse approfondie des différents standards de tokens et de leur utilisation.',
    image: '/images/blog/token-standards.jpg',
    date: '2024-03-01',
    category: 'Technique'
  }
];

const BlogPage: React.FC = () => {
  return (
    <StyledSection>
      <Container maxWidth="lg">
        <Box mb={8} textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Blog TokenForge
            </Typography>
            <Typography variant="h5" color="textSecondary">
              Actualités, guides et analyses sur la tokenisation et la blockchain
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {blogPosts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StyledCard>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                    />
                    <CardContent>
                      <Typography 
                        variant="overline" 
                        component="div"
                        color="primary"
                      >
                        {post.category}
                      </Typography>
                      <Typography 
                        variant="subtitle2" 
                        color="textSecondary" 
                        gutterBottom
                      >
                        {new Date(post.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        gutterBottom
                      >
                        {post.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                      >
                        {post.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </StyledSection>
  );
};

export default BlogPage; 