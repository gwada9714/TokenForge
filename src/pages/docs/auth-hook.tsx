import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { remark } from 'remark';
import html from 'remark-html';
import CircularProgress from '@mui/material/CircularProgress';

interface AuthHookDocProps {}

const AuthHookDoc: React.FC<AuthHookDocProps> = () => {
  const navigate = useNavigate();
  const [contentHtml, setContentHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/docs/auth-hook.md')
      .then(response => {
        if (!response.ok) {
          throw new Error('Impossible de charger la documentation');
        }
        return response.text();
      })
      .then(async (markdown) => {
        const processedContent = await remark()
          .use(html)
          .process(markdown);
        setContentHtml(processedContent.toString());
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement de la documentation:', error);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Documentation du Hook d'Authentification | TokenForge</title>
        <meta name="description" content="Documentation complète du hook d'authentification Firebase dans TokenForge" />
      </Helmet>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Documentation du Hook d'Authentification
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/auth-demo')}
            >
              Voir la démonstration
            </Button>
          </Box>
          
          <Paper sx={{ p: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box 
                className="markdown-content" 
                dangerouslySetInnerHTML={{ __html: contentHtml }} 
                sx={{
                  '& code': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '0.2em 0.4em',
                    borderRadius: '3px',
                    fontFamily: 'monospace'
                  },
                  '& pre': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '1em',
                    borderRadius: '5px',
                    overflow: 'auto'
                  },
                  '& pre code': {
                    backgroundColor: 'transparent',
                    padding: 0
                  },
                  '& blockquote': {
                    borderLeft: '4px solid #ddd',
                    paddingLeft: '1em',
                    margin: '0 0 1em 0',
                    color: 'text.secondary'
                  },
                  '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    marginBottom: '1em'
                  },
                  '& th, & td': {
                    border: '1px solid #ddd',
                    padding: '8px 12px',
                    textAlign: 'left'
                  },
                  '& th': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              />
            )}
          </Paper>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/auth-demo')}
            >
              Retour à la démonstration
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AuthHookDoc;
