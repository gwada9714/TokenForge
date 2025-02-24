import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Title, Text, Button, Alert } from '@/components/ui';
import { useService } from '@/features/services/hooks/useService';
import { ServiceType } from '@/features/services/types/services';
import { spacing } from '@/theme';

const ConfigContainer = styled(Container)`
  max-width: 800px;
  padding: ${spacing.xl} ${spacing.md};
`;

const Header = styled.div`
  margin-bottom: ${spacing.xl};
`;

const PageTitle = styled(Title)`
  margin-bottom: ${spacing.md};
`;

const Description = styled(Text)`
  color: ${({ theme }) => theme.colors.textLight};
`;

const ConfigForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  margin: ${spacing.xl} 0;
`;

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const SectionTitle = styled.h3`
  margin-bottom: ${spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const InputGroup = styled.div`
  margin-bottom: ${spacing.md};

  label {
    display: block;
    margin-bottom: ${spacing.xs};
    color: ${({ theme }) => theme.colors.text};
  }

  input, select, textarea {
    width: 100%;
    padding: ${spacing.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    background: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.text};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const PricePreview = styled.div`
  margin: ${spacing.xl} 0;
  padding: ${spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;

  h3 {
    margin-bottom: ${spacing.md};
    color: ${({ theme }) => theme.colors.text};
  }

  .price {
    font-size: 2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
  }

  .details {
    margin-top: ${spacing.sm};
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-top: ${spacing.xl};
`;

export const ServiceConfiguration: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestService, isProcessing, error } = useService();
  const [config, setConfig] = React.useState({
    name: '',
    description: '',
    network: '',
    customRequirements: '',
  });

  const serviceType = location.state?.serviceType as ServiceType;

  if (!serviceType) {
    navigate('/services');
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestService(serviceType, config);
      navigate('/dashboard', { state: { message: 'Service configuré avec succès !' } });
    } catch (err) {
      console.error('Erreur lors de la configuration du service:', err);
    }
  };

  const handleCancel = () => {
    navigate('/services');
  };

  return (
    <ConfigContainer>
      <Header>
        <PageTitle>Configuration du Service</PageTitle>
        <Description>
          Personnalisez votre service selon vos besoins spécifiques. Notre équipe
          examinera votre configuration et vous contactera pour finaliser les détails.
        </Description>
      </Header>

      {error && (
        <Alert variant="error" style={{ marginBottom: spacing.lg }}>
          {error}
        </Alert>
      )}

      <ConfigForm onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Informations Générales</SectionTitle>
          <InputGroup>
            <label htmlFor="name">Nom du Projet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={config.name}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="description">Description du Projet</label>
            <textarea
              id="description"
              name="description"
              value={config.description}
              onChange={handleInputChange}
              required
            />
          </InputGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Configuration Technique</SectionTitle>
          <InputGroup>
            <label htmlFor="network">Réseau Blockchain</label>
            <select
              id="network"
              name="network"
              value={config.network}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionnez un réseau</option>
              <option value="ethereum">Ethereum</option>
              <option value="bsc">Binance Smart Chain</option>
              <option value="polygon">Polygon</option>
              <option value="avalanche">Avalanche</option>
            </select>
          </InputGroup>

          <InputGroup>
            <label htmlFor="customRequirements">Exigences Spécifiques</label>
            <textarea
              id="customRequirements"
              name="customRequirements"
              value={config.customRequirements}
              onChange={handleInputChange}
              placeholder="Décrivez vos besoins spécifiques ou exigences particulières..."
            />
          </InputGroup>
        </FormSection>

        <PricePreview>
          <h3>Estimation du Prix</h3>
          <div className="price">À partir de 2 ETH</div>
          <div className="details">
            Le prix final sera déterminé après l'examen de votre configuration
          </div>
        </PricePreview>

        <ButtonGroup>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isProcessing}
          >
            {isProcessing ? 'Configuration en cours...' : 'Configurer le Service'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Annuler
          </Button>
        </ButtonGroup>
      </ConfigForm>
    </ConfigContainer>
  );
}; 