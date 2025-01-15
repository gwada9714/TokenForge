import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Heading,
} from '@chakra-ui/react';
import { TokenConfig } from '@/types/token';

interface TokenConfigurationProps {
  tokenConfig: TokenConfig;
  setTokenConfig: React.Dispatch<React.SetStateAction<TokenConfig>>;
}

const TokenConfiguration: React.FC<TokenConfigurationProps> = ({
  tokenConfig,
  setTokenConfig,
}) => {
  const handleChange = (field: keyof TokenConfig, value: any) => {
    setTokenConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const features = [
    'Mint',
    'Burn',
    'Pause',
    'Blacklist',
    'Anti-Bot',
    'Max Transaction',
    'Max Wallet',
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md" mb={4}>Configuration du Token</Heading>

      <FormControl isRequired>
        <FormLabel>Nom du Token</FormLabel>
        <Input
          value={tokenConfig.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: TokenForge Token"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Symbole</FormLabel>
        <Input
          value={tokenConfig.symbol}
          onChange={(e) => handleChange('symbol', e.target.value)}
          placeholder="Ex: TKN"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Offre Totale</FormLabel>
        <NumberInput
          value={tokenConfig.supply}
          onChange={(value) => handleChange('supply', value)}
          min={1}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Décimales</FormLabel>
        <NumberInput
          value={tokenConfig.decimals}
          onChange={(value) => handleChange('decimals', parseInt(value))}
          min={0}
          max={18}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Fonctionnalités</FormLabel>
        <CheckboxGroup
          value={tokenConfig.features}
          onChange={(value) => handleChange('features', value)}
        >
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {features.map((feature) => (
              <Checkbox key={feature} value={feature}>
                {feature}
              </Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </FormControl>
    </VStack>
  );
};

export default TokenConfiguration;
