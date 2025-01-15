import React from 'react';
import {
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
} from '@chakra-ui/react';
import { TokenConfig } from '@/types/token';

interface TokenVerificationProps {
  tokenConfig: TokenConfig;
}

const TokenVerification: React.FC<TokenVerificationProps> = ({ tokenConfig }) => {
  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md" mb={4}>Vérification du Token</Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Paramètre</Th>
            <Th>Valeur</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Plan</Td>
            <Td>
              <Badge colorScheme="red">{tokenConfig.plan}</Badge>
            </Td>
          </Tr>
          <Tr>
            <Td>Nom</Td>
            <Td>{tokenConfig.name}</Td>
          </Tr>
          <Tr>
            <Td>Symbole</Td>
            <Td>{tokenConfig.symbol}</Td>
          </Tr>
          <Tr>
            <Td>Offre Totale</Td>
            <Td>{tokenConfig.supply}</Td>
          </Tr>
          <Tr>
            <Td>Décimales</Td>
            <Td>{tokenConfig.decimals}</Td>
          </Tr>
          <Tr>
            <Td>Fonctionnalités</Td>
            <Td>
              {tokenConfig.features.map((feature) => (
                <Badge key={feature} m={1} colorScheme="green">
                  {feature}
                </Badge>
              ))}
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Text fontSize="sm" color="gray.500">
        Veuillez vérifier attentivement tous les paramètres avant le déploiement.
        Une fois le token déployé, certains paramètres ne pourront plus être modifiés.
      </Text>
    </VStack>
  );
};

export default TokenVerification;
