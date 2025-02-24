import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { ServiceType, MarketingConfig as IMarketingConfig } from '../types';
import type { MockServiceHook, MockComponentProps } from '../types/test-types';

const MockMarketingConfig: React.FC<MockComponentProps> = () => {
  return (
    <div>
      <h2>Configuration de la Campagne Marketing</h2>
      
      <section>
        <h3>Informations Générales</h3>
        <label htmlFor="projectName">Nom du Projet</label>
        <input id="projectName" />
        
        <label htmlFor="projectDescription">Description du Projet</label>
        <textarea id="projectDescription" />
      </section>

      <section>
        <h3>Réseaux Sociaux</h3>
        <label htmlFor="twitter">Twitter</label>
        <input id="twitter" />
        
        <label htmlFor="telegram">Telegram</label>
        <input id="telegram" />
        
        <label htmlFor="discord">Discord</label>
        <input id="discord" />
        
        <label htmlFor="medium">Medium</label>
        <input id="medium" />
      </section>

      <section>
        <h3>Campagne d'Influenceurs</h3>
        <label htmlFor="budget">Budget (ETH)</label>
        <input id="budget" type="number" />
        
        <label htmlFor="objectives">Objectifs de la Campagne</label>
        <textarea id="objectives" />
      </section>

      <section>
        <h3>Relations Publiques</h3>
        <label htmlFor="prType">Type de Communiqué</label>
        <input id="prType" />
        
        <label htmlFor="keyPoints">Points Clés</label>
        <textarea id="keyPoints" />
      </section>

      <button>Configurer</button>
    </div>
  );
};

vi.mock('@/features/services/pages/MarketingConfig', () => ({
  MarketingConfig: MockMarketingConfig
}));

const mockUseService = vi.fn();

vi.mock('@/features/services/hooks/useService', () => ({
  useService: () => mockUseService()
}));

describe('MarketingConfig Component', () => {
  const mockConfigureService = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: null,
      isProcessing: false
    } as MockServiceHook);
  });

  it('affiche le formulaire de configuration marketing', () => {
    render(<MockMarketingConfig />);

    expect(screen.getByLabelText(/Nom du Projet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description du Projet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Twitter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telegram/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Discord/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Medium/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type de Communiqué/i)).toBeInTheDocument();
  });

  it('gère la soumission du formulaire correctement', async () => {
    render(<MockMarketingConfig />);

    const projectName = screen.getByLabelText(/Nom du Projet/i);
    const projectDescription = screen.getByLabelText(/Description du Projet/i);
    const twitter = screen.getByLabelText(/Twitter/i);
    const telegram = screen.getByLabelText(/Telegram/i);
    const discord = screen.getByLabelText(/Discord/i);
    const medium = screen.getByLabelText(/Medium/i);
    const budget = screen.getByLabelText(/Budget/i);
    const objectives = screen.getByLabelText(/Objectifs/i);
    const prType = screen.getByLabelText(/Type de Communiqué/i);
    const keyPoints = screen.getByLabelText(/Points Clés/i);
    const submitButton = screen.getByRole('button', { name: /Configurer/i });

    await fireEvent.change(projectName, { target: { value: 'Mon Projet' } });
    await fireEvent.change(projectDescription, { target: { value: 'Description détaillée du projet marketing' } });
    await fireEvent.change(twitter, { target: { value: '@monprojet' } });
    await fireEvent.change(telegram, { target: { value: 't.me/monprojet' } });
    await fireEvent.change(discord, { target: { value: 'discord.gg/monprojet' } });
    await fireEvent.change(medium, { target: { value: '@monprojet' } });
    await fireEvent.change(budget, { target: { value: '10' } });
    await fireEvent.change(objectives, { target: { value: 'Augmenter la visibilité' } });
    await fireEvent.change(prType, { target: { value: 'Lancement' } });
    await fireEvent.change(keyPoints, { target: { value: 'Points clés du projet' } });

    await fireEvent.click(submitButton);

    expect(mockConfigureService).toHaveBeenCalledWith(ServiceType.MARKETING, {
      projectName: 'Mon Projet',
      projectDescription: 'Description détaillée du projet marketing',
      socialMedia: {
        twitter: '@monprojet',
        telegram: 't.me/monprojet',
        discord: 'discord.gg/monprojet',
        medium: '@monprojet'
      },
      influencerCampaign: {
        budget: '10',
        objectives: 'Augmenter la visibilité'
      },
      prCampaign: {
        type: 'Lancement',
        keyPoints: 'Points clés du projet'
      }
    } as IMarketingConfig);
  });

  it('affiche les erreurs de validation', async () => {
    render(<MockMarketingConfig />);

    const submitButton = screen.getByRole('button', { name: /Configurer/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/Le nom du projet est requis/i)).toBeInTheDocument();
    expect(screen.getByText(/La description du projet est requise/i)).toBeInTheDocument();
    expect(screen.getByText(/Le budget est requis/i)).toBeInTheDocument();
    expect(screen.getByText(/Le type de communiqué est requis/i)).toBeInTheDocument();
  });

  it('valide la longueur minimale de la description', async () => {
    render(<MockMarketingConfig />);

    const description = screen.getByLabelText(/Description du Projet/i);
    await fireEvent.change(description, { target: { value: 'Trop court' } });
    await fireEvent.blur(description);

    expect(screen.getByText(/La description doit faire au moins 100 caractères/i)).toBeInTheDocument();
  });

  it('valide que le budget est positif', async () => {
    render(<MockMarketingConfig />);

    const budget = screen.getByLabelText(/Budget/i);
    await fireEvent.change(budget, { target: { value: '-5' } });
    await fireEvent.blur(budget);

    expect(screen.getByText(/Le budget doit être positif/i)).toBeInTheDocument();
  });

  it('affiche une alerte en cas d\'erreur du service', () => {
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: 'Erreur de configuration',
      isProcessing: false
    } as MockServiceHook);

    render(<MockMarketingConfig />);
    expect(screen.getByText('Erreur de configuration')).toBeInTheDocument();
  });

  it('désactive le bouton de soumission pendant le traitement', () => {
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: null,
      isProcessing: true
    } as MockServiceHook);

    render(<MockMarketingConfig />);
    const submitButton = screen.getByRole('button', { name: /Configurer/i });
    expect(submitButton).toBeDisabled();
  });
}); 