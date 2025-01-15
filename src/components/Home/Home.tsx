import React from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Home = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, orange.400, red.500)',
    'linear(to-r, orange.200, red.300)'
  );

  return (
    <Box>
      {/* Hero Section */}
      <Container maxW={'3xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
          >
            TokenForge :{' '}
            <Text as={'span'} bgGradient={bgGradient} bgClip="text">
              Forgez votre Avenir Crypto
            </Text>
          </Heading>
          <Text color={'gray.500'}>
            Créez des tokens personnalisés en quelques clics. Notre plateforme combine puissance
            et simplicité pour vous permettre de forger des tokens sur mesure, en toute sécurité.
          </Text>
          <Stack
            direction={'column'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <Button
              as={Link}
              to="/tokens/create"
              colorScheme={'red'}
              bg={'red.400'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'red.500',
              }}
            >
              Commencer à Forger
            </Button>
            <Button
              as={Link}
              to="/learn"
              variant={'link'}
              colorScheme={'blue'}
              size={'sm'}
            >
              En savoir plus
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW={'6xl'}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Feature
              icon={<Icon as={SecurityIcon} w={10} h={10} />}
              title={'Sécurité Renforcée'}
              text={'Audits de sécurité et verrouillage de liquidité intégré pour protéger votre projet.'}
            />
            <Feature
              icon={<Icon as={CustomizationIcon} w={10} h={10} />}
              title={'Personnalisation Totale'}
              text={'Configurez chaque aspect de votre token selon vos besoins spécifiques.'}
            />
            <Feature
              icon={<Icon as={MultiChainIcon} w={10} h={10} />}
              title={'Support Multi-Chain'}
              text={'Déployez vos tokens sur les principales blockchains en un clic.'}
            />
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

const Feature: React.FC<FeatureProps> = ({ title, text, icon }) => {
  return (
    <Stack align={'center'} textAlign={'center'}>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'red.500'}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};

const SecurityIcon = createIcon({
  displayName: 'SecurityIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
    />
  ),
});

const CustomizationIcon = createIcon({
  displayName: 'CustomizationIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
    />
  ),
});

const MultiChainIcon = createIcon({
  displayName: 'MultiChainIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"
    />
  ),
});

export default Home;
