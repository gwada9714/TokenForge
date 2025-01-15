import React from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  Text,
  Button,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Icon,
  Heading,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { FaHammer, FaGem, FaCrown } from 'react-icons/fa';
import { PlanSelectionProps } from '@/types/components';
import { TokenConfig } from '@/types/token';

const PlanSelection: React.FC<PlanSelectionProps> = ({ setTokenConfig }) => {
  const bgCard = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const plans = [
    {
      name: 'Apprenti Forgeron',
      price: 'Gratuit',
      icon: FaHammer,
      features: [
        'Création de token simple sur testnet',
        'Fonctionnalités très limitées',
        'Code non audité',
      ],
      buttonText: 'Commencer',
      value: 'apprentice',
    },
    {
      name: 'Forgeron',
      price: '0.3 BNB',
      icon: FaGem,
      features: [
        'Création de token sur mainnet',
        'Fonctionnalités de base',
        'Option de taxe de la forge',
        'Audit de sécurité en option',
        'Support standard',
      ],
      buttonText: 'Choisir ce Plan',
      value: 'smith',
      isPopular: true,
    },
    {
      name: 'Maître Forgeron',
      price: '1 BNB',
      icon: FaCrown,
      features: [
        'Toutes les fonctionnalités avancées',
        'Audit de sécurité inclus',
        'Badge "Trempé et Certifié"',
        'Verrouillage de liquidité facilité',
        'Support prioritaire',
      ],
      buttonText: 'Devenir Maître',
      value: 'master',
    },
  ];

  const handleSelectPlan = (planValue: string): void => {
    setTokenConfig((prev: TokenConfig) => ({
      ...prev,
      plan: planValue,
    }));
  };

  return (
    <Box py={6}>
      <Heading size="lg" mb={8} textAlign="center">
        Choisissez votre Forge
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        {plans.map((plan) => (
          <Box
            key={plan.name}
            bg={bgCard}
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            position="relative"
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-5px)' }}
          >
            {plan.isPopular && (
              <Box
                position="absolute"
                top={4}
                right={4}
                bg="red.500"
                color="white"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="sm"
              >
                Populaire
              </Box>
            )}
            <VStack spacing={6} p={6} align="stretch" height="100%">
              <VStack spacing={2}>
                <Icon as={plan.icon} w={10} h={10} color="red.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {plan.name}
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {plan.price}
                </Text>
              </VStack>

              <List spacing={3} flex="1">
                {plan.features.map((feature) => (
                  <ListItem key={feature}>
                    <ListIcon as={CheckIcon} color="green.500" />
                    {feature}
                  </ListItem>
                ))}
              </List>

              <Button
                colorScheme={plan.isPopular ? 'red' : 'gray'}
                size="lg"
                w="full"
                onClick={() => handleSelectPlan(plan.value)}
              >
                {plan.buttonText}
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default PlanSelection;
