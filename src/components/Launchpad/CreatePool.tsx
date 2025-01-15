import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Text,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useLaunchpad } from '../../hooks/useLaunchpad';

export const CreatePool: React.FC = () => {
  const toast = useToast();
  const { createPool, isCreating } = useLaunchpad();

  const [formData, setFormData] = useState({
    token: '',
    tokenPrice: '',
    hardCap: '',
    softCap: '',
    minContribution: '',
    maxContribution: '',
    startTime: '',
    endTime: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startTimestamp = new Date(formData.startTime).getTime() / 1000;
    const endTimestamp = new Date(formData.endTime).getTime() / 1000;

    if (startTimestamp >= endTimestamp) {
      toast({
        title: 'Invalid dates',
        description: 'End time must be after start time',
        status: 'error',
      });
      return;
    }

    createPool(
      formData.token,
      formData.tokenPrice,
      formData.hardCap,
      formData.softCap,
      formData.minContribution,
      formData.maxContribution,
      startTimestamp,
      endTimestamp
    );
  };

  return (
    <Card p={6} maxW="xl" mx="auto" mt={8}>
      <Text variant="h5" mb={4}>
        Create Launchpad Pool
      </Text>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Token Address</FormLabel>
            <Input
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="0x..."
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Token Price (ETH)</FormLabel>
            <Input
              name="tokenPrice"
              type="number"
              step="0.000000000000000001"
              value={formData.tokenPrice}
              onChange={handleInputChange}
              placeholder="0.0"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Hard Cap (ETH)</FormLabel>
            <Input
              name="hardCap"
              type="number"
              step="0.01"
              value={formData.hardCap}
              onChange={handleInputChange}
              placeholder="100"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Soft Cap (ETH)</FormLabel>
            <Input
              name="softCap"
              type="number"
              step="0.01"
              value={formData.softCap}
              onChange={handleInputChange}
              placeholder="50"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Minimum Contribution (ETH)</FormLabel>
            <Input
              name="minContribution"
              type="number"
              step="0.01"
              value={formData.minContribution}
              onChange={handleInputChange}
              placeholder="0.1"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Maximum Contribution (ETH)</FormLabel>
            <Input
              name="maxContribution"
              type="number"
              step="0.01"
              value={formData.maxContribution}
              onChange={handleInputChange}
              placeholder="10"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Start Time</FormLabel>
            <Input
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>End Time</FormLabel>
            <Input
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleInputChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isCreating}
            loadingText="Creating"
            w="full"
          >
            Create Pool
          </Button>
        </VStack>
      </form>
    </Card>
  );
};
