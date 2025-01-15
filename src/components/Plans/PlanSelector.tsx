import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { UserLevel, DEFAULT_PLANS } from '../../types/plans';
import { useUserPlan } from '../../contexts/UserPlanContext';

const PlanFeatureItem: React.FC<{ feature: string; isAvailable: boolean }> = ({
  feature,
  isAvailable,
}) => (
  <HStack spacing={2}>
    <Icon
      as={isAvailable ? FaCheck : FaTimes}
      color={isAvailable ? 'green.500' : 'red.500'}
    />
    <Text>{feature}</Text>
  </HStack>
);

const PlanCard: React.FC<{
  level: UserLevel;
  isCurrentPlan: boolean;
  onSelect: () => void;
}> = ({ level, isCurrentPlan, onSelect }) => {
  const plan = DEFAULT_PLANS[level];
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="2px"
      borderColor={isCurrentPlan ? 'forge.500' : 'gray.200'}
      boxShadow="lg"
      width="full"
      maxW="sm"
      position="relative"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      {isCurrentPlan && (
        <Badge
          position="absolute"
          top={-3}
          right={-3}
          colorScheme="orange"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          Plan Actuel
        </Badge>
      )}

      <VStack spacing={4} align="stretch">
        <Heading size="lg" color="forge.500">
          {plan.name}
        </Heading>
        <Text color="gray.600">{plan.description}</Text>

        <Box py={4}>
          <Heading size="xl" mb={2}>
            {plan.price.bnb} BNB
            <Text as="span" fontSize="md" color="gray.500">
              {' '}
              ou {plan.price.tkn} TKN
            </Text>
          </Heading>
        </Box>

        <VStack align="stretch" spacing={3}>
          <Text fontWeight="bold" mb={2}>
            Fonctionnalités incluses :
          </Text>
          <PlanFeatureItem
            feature="Déploiement Mainnet"
            isAvailable={plan.features.canDeployMainnet}
          />
          <PlanFeatureItem
            feature="Taxes Personnalisées"
            isAvailable={plan.features.tokenFeatures.customTax}
          />
          <PlanFeatureItem
            feature="Audit de Sécurité"
            isAvailable={plan.features.tokenFeatures.audit}
          />
          <PlanFeatureItem
            feature="Support Prioritaire"
            isAvailable={plan.features.prioritySupport}
          />
        </VStack>

        <Button
          variant="forge"
          size="lg"
          isDisabled={isCurrentPlan}
          onClick={onSelect}
          mt={4}
        >
          {isCurrentPlan ? 'Plan Actuel' : 'Sélectionner'}
        </Button>
      </VStack>
    </Box>
  );
};

export const PlanSelector: React.FC = () => {
  const { userLevel, upgradePlan } = useUserPlan();

  const handlePlanSelect = async (selectedLevel: UserLevel) => {
    try {
      await upgradePlan(selectedLevel);
    } catch (error) {
      console.error('Erreur lors de la mise à niveau du plan:', error);
    }
  };

  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="2xl" mb={4}>
            Choisissez votre Plan
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Forgez votre token avec le plan qui correspond à vos besoins
          </Text>
        </Box>

        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={8}
          justify="center"
          align="stretch"
        >
          {Object.values(UserLevel).map((level) => (
            <PlanCard
              key={level}
              level={level}
              isCurrentPlan={level === userLevel}
              onSelect={() => handlePlanSelect(level)}
            />
          ))}
        </Flex>
      </VStack>
    </Box>
  );
};

export default PlanSelector;
