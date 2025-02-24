import { describe, it, expect } from 'vitest';
import { 
  getServiceById, 
  calculateServicePrice, 
  isServiceAvailableOnNetwork,
  SERVICES 
} from '@/features/services/config/services';
import { ServiceType } from '@/features/services/types/services';
import { SUPPORTED_CHAINS } from '@/config/constants/chains';

describe('Service Utilities', () => {
  describe('getServiceById', () => {
    it('retourne le bon service pour un ID valide', () => {
      const service = getServiceById(ServiceType.LAUNCHPAD);
      expect(service).toBeDefined();
      expect(service?.id).toBe(ServiceType.LAUNCHPAD);
      expect(service?.name).toBe('Launchpad');
    });

    it('retourne undefined pour un ID invalide', () => {
      const service = getServiceById('INVALID_ID' as ServiceType);
      expect(service).toBeUndefined();
    });
  });

  describe('calculateServicePrice', () => {
    it('calcule correctement le prix de base sans pourcentage', () => {
      const service = SERVICES.find(s => !s.price.percentageFee);
      if (!service) throw new Error('Service sans pourcentage non trouvé');
      
      const price = calculateServicePrice(service);
      expect(price).toBe(service.price.baseFee);
    });

    it('calcule correctement le prix avec pourcentage', () => {
      const service = SERVICES.find(s => s.price.percentageFee);
      if (!service) throw new Error('Service avec pourcentage non trouvé');
      
      const amount = 100;
      const expectedPrice = service.price.baseFee + (amount * (service.price.percentageFee || 0) / 100);
      const price = calculateServicePrice(service, amount);
      expect(price).toBe(expectedPrice);
    });
  });

  describe('isServiceAvailableOnNetwork', () => {
    it('retourne true pour un réseau supporté', () => {
      const service = SERVICES[0];
      const network = Object.values(SUPPORTED_CHAINS)[0].name;
      
      const isAvailable = isServiceAvailableOnNetwork(service, network);
      expect(isAvailable).toBe(true);
    });

    it('retourne false pour un réseau non supporté', () => {
      const service = SERVICES[0];
      const isAvailable = isServiceAvailableOnNetwork(service, 'UNSUPPORTED_NETWORK');
      expect(isAvailable).toBe(false);
    });
  });
}); 