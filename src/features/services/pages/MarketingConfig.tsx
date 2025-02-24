import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { Alert, Button, Input, TextArea } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { THEME_CONFIG } from '@/config/constants/theme';
import { useService } from '../hooks/useService';
import { MarketingConfig as IMarketingConfig, ServiceType } from '../types/services';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${THEME_CONFIG.spacing.xl};
`;

const Section = styled(Card)`
  margin-bottom: ${THEME_CONFIG.spacing.lg};
  padding: ${THEME_CONFIG.spacing.lg};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${THEME_CONFIG.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: ${THEME_CONFIG.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${THEME_CONFIG.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SocialLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${THEME_CONFIG.spacing.md};
`;

export const MarketingConfig: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IMarketingConfig>();
  const { configureService, error, isProcessing } = useService();

  const getErrorMessage = (fieldPath: string) => {
    return fieldPath.split('.').reduce((obj: FieldValues | undefined, key: string) => {
      return obj?.[key];
    }, errors)?.message as string | undefined;
  };

  const onSubmit = async (data: IMarketingConfig) => {
    try {
      await configureService(ServiceType.MARKETING, data);
    } catch (err) {
      console.error('Erreur lors de la configuration du marketing:', err);
    }
  };

  return (
    <Container>
      <h2>Configuration de la Campagne Marketing</h2>
      
      {error && (
        <div style={{ marginBottom: THEME_CONFIG.spacing.md }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <SectionTitle>Informations Générales</SectionTitle>
          <FormGroup>
            <Label htmlFor="projectName">Nom du Projet</Label>
            <Input
              id="projectName"
              {...register('projectName', { required: 'Le nom du projet est requis' })}
              error={getErrorMessage('projectName')}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="description">Description du Projet</Label>
            <TextArea
              id="description"
              {...register('description', { 
                required: 'La description du projet est requise',
                minLength: { value: 100, message: 'La description doit faire au moins 100 caractères' }
              })}
              error={getErrorMessage('description')}
              rows={4}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Réseaux Sociaux</SectionTitle>
          <SocialLinks>
            <FormGroup>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register('socialMedia.twitter')}
                placeholder="@username"
                error={getErrorMessage('socialMedia.twitter')}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                {...register('socialMedia.telegram')}
                placeholder="t.me/group"
                error={getErrorMessage('socialMedia.telegram')}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                {...register('socialMedia.discord')}
                placeholder="discord.gg/invite"
                error={getErrorMessage('socialMedia.discord')}
              />
            </FormGroup>
          </SocialLinks>
        </Section>

        <Section>
          <SectionTitle>Campagne d'Influenceurs</SectionTitle>
          <FormGroup>
            <Label htmlFor="budget">Budget (ETH)</Label>
            <Input
              id="budget"
              type="number"
              {...register('influencerCampaign.budget', { 
                required: 'Le budget est requis',
                min: { value: 0, message: 'Le budget doit être positif' }
              })}
              error={getErrorMessage('influencerCampaign.budget')}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="objectives">Objectifs de la Campagne</Label>
            <TextArea
              id="objectives"
              {...register('influencerCampaign.objectives')}
              placeholder="Décrivez vos objectifs..."
              rows={3}
              error={getErrorMessage('influencerCampaign.objectives')}
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Relations Publiques</SectionTitle>
          <FormGroup>
            <Label htmlFor="prType">Type de Communiqué</Label>
            <Input
              id="prType"
              {...register('prCampaign.type', { required: 'Le type de communiqué est requis' })}
              placeholder="Lancement / Mise à jour / Partenariat"
              error={getErrorMessage('prCampaign.type')}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="keyPoints">Points Clés</Label>
            <TextArea
              id="keyPoints"
              {...register('prCampaign.keyPoints')}
              placeholder="Points principaux à communiquer..."
              rows={3}
              error={getErrorMessage('prCampaign.keyPoints')}
            />
          </FormGroup>
        </Section>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isProcessing}
        >
          {isProcessing ? 'Configuration en cours...' : 'Lancer la Campagne Marketing'}
        </Button>
      </form>
    </Container>
  );
}; 