import { 
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'

export const CreateTokenForm = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  
  return (
    <VStack 
      as="form"
      spacing={4} 
      align="stretch"
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
    >
      <FormControl isRequired>
        <FormLabel>Nom du Token</FormLabel>
        <Input placeholder="Nom du Token" />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Symbole</FormLabel>
        <Input placeholder="Symbole" />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Supply Initial</FormLabel>
        <Input placeholder="Supply Initial" type="number" />
      </FormControl>
      <Button type="submit" size="lg">
        Créer Token
      </Button>
    </VStack>
  )
} 