import { Heading, Text, Button, VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <VStack spacing={8} py={20} textAlign="center">
      <Heading size="2xl">
        Créez votre Token en quelques clics
      </Heading>
      <Text fontSize="xl" maxW="container.md">
        TokenForge vous permet de créer et déployer vos propres tokens sur la blockchain 
        rapidement et en toute sécurité.
      </Text>
      <Button
        as={Link}
        to="/tokens/create"
        size="lg"
        colorScheme="blue"
      >
        Commencer
      </Button>
    </VStack>
  )
}

export default Home;