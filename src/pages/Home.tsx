import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { FaRocket, FaShieldAlt, FaCog, FaChartLine } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface FeatureProps {
  icon: IconType;
  title: string;
  text: string;
}

const Feature = ({ icon, title, text }: FeatureProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
    >
      <Icon as={icon} w={10} h={10} mb={4} color="blue.500" />
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray.500">{text}</Text>
    </Box>
  );
};

const Home = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.600, purple.700)'
  );
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box>
      {/* Hero Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient={bgGradient}
              bgClip="text"
              fontWeight="extrabold"
            >
              TokenForge
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl">
              Créez et gérez vos tokens ERC20 en quelques clics sur les principales blockchains
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                as={Link}
                to="/tokens/create"
                size="lg"
                colorScheme="blue"
                leftIcon={<FaRocket />}
              >
                Créer un Token
              </Button>
              <Button
                as={Link}
                to="/tokens"
                size="lg"
                variant="outline"
                colorScheme="blue"
              >
                Voir mes Tokens
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
          <Feature
            icon={FaRocket}
            title="Déploiement Rapide"
            text="Créez et déployez vos tokens en quelques minutes sans code"
          />
          <Feature
            icon={FaShieldAlt}
            title="Sécurité Maximale"
            text="Smart contracts audités et sécurisés par OpenZeppelin"
          />
          <Feature
            icon={FaCog}
            title="Personnalisation"
            text="Configurez tous les aspects de votre token selon vos besoins"
          />
          <Feature
            icon={FaChartLine}
            title="Gestion Simple"
            text="Gérez vos tokens facilement avec une interface intuitive"
          />
        </SimpleGrid>
      </Container>

      {/* Footer */}
      <Box py={10} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <Flex justify="center">
            <Text color={textColor}>
              2025 TokenForge. All rights reserved.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;