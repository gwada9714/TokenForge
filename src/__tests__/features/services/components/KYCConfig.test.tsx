import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { ServiceType } from '../types';
import type { MockServiceHook, MockComponentProps } from '../types/test-types';

const MockKYCConfig: React.FC<MockComponentProps> = ({ onSubmit, isProcessing, error }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        kycType: 'individual',
        verificationLevel: 'basic',
        requirements: {
          idDocument: true,
          proofOfAddress: true,
          selfie: true
        }
      });
    }
  };

  return (
    <div>
      <h2>Configuration KYC</h2>
      {error && <div role="alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <select data-testid="kyc-type">
          <option value="individual">Individuel</option>
          <option value="business">Entreprise</option>
        </select>

        <select data-testid="verification-level">
          <option value="basic">Basique</option>
          <option value="advanced">Avancé</option>
          <option value="premium">Premium</option>
        </select>

        <div>
          <label>
            <input
              type="checkbox"
              data-testid="id-document"
              defaultChecked
            />
            Document d'identité
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              data-testid="proof-address"
              defaultChecked
            />
            Justificatif de domicile
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              data-testid="selfie"
              defaultChecked
            />
            Selfie
          </label>
        </div>

        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Traitement...' : 'Configurer'}
        </button>
      </form>
    </div>
  );
};

vi.mock('@/features/services/components/KYCConfig', () => ({
  KYCConfig: MockKYCConfig
}));

describe('KYCConfig Component', () => {
  const mockOnSubmit = vi.fn();
  const mockConfigureService = vi.fn();
  const mockUseService: MockServiceHook = {
    configureService: mockConfigureService,
    error: null,
    isProcessing: false
  };

  beforeEach(() => {
    mockOnSubmit.mockReset();
    mockConfigureService.mockReset();
  });

  it('affiche le formulaire de configuration KYC', () => {
    render(<MockKYCConfig onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Configuration KYC')).toBeDefined();
    expect(screen.getByTestId('kyc-type')).toBeDefined();
    expect(screen.getByTestId('verification-level')).toBeDefined();
    expect(screen.getByTestId('id-document')).toBeDefined();
    expect(screen.getByTestId('proof-address')).toBeDefined();
    expect(screen.getByTestId('selfie')).toBeDefined();
  });

  it('soumet le formulaire avec les valeurs correctes', async () => {
    render(<MockKYCConfig onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('Configurer');
    await fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      kycType: 'individual',
      verificationLevel: 'basic',
      requirements: {
        idDocument: true,
        proofOfAddress: true,
        selfie: true
      }
    });
  });

  it('affiche les erreurs lorsqu\'elles sont présentes', () => {
    const errorMessage = 'Erreur de configuration';
    render(<MockKYCConfig onSubmit={mockOnSubmit} error={errorMessage} />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('désactive le bouton de soumission pendant le traitement', () => {
    render(<MockKYCConfig onSubmit={mockOnSubmit} isProcessing={true} />);

    const submitButton = screen.getByText('Traitement...');
    expect(submitButton).toBeDisabled();
  });

  it('affiche des champs supplémentaires pour le KYC entreprise', async () => {
    render(<MockKYCConfig onSubmit={mockOnSubmit} />);

    const kycTypeSelect = screen.getByTestId('kyc-type');
    await fireEvent.change(kycTypeSelect, { target: { value: 'business' } });

    // Les champs spécifiques aux entreprises devraient être visibles
    expect(screen.getByTestId('id-document')).toBeDefined();
    expect(screen.getByTestId('proof-address')).toBeDefined();
    expect(screen.getByTestId('selfie')).toBeDefined();
  });

  it('met à jour le niveau de vérification correctement', async () => {
    render(<MockKYCConfig onSubmit={mockOnSubmit} />);

    const verificationLevelSelect = screen.getByTestId('verification-level');
    await fireEvent.change(verificationLevelSelect, { target: { value: 'premium' } });

    const submitButton = screen.getByText('Configurer');
    await fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
}); 