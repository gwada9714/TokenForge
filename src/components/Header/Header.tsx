import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Image,
  HStack,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useUserPlan } from '../../contexts/UserPlanContext';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { userLevel } = useUserPlan();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <ChakraLink
      as={Link}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </ChakraLink>
  );

  return (
    <Box
      bg={bgColor}
      px={4}
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <HStack spacing={8} alignItems={'center'}>
          <Link to="/">
            <Image
              src="/images/logo.svg"
              alt="TokenForge Logo"
              height="40px"
              width="40px"
            />
          </Link>

          {/* Navigation Desktop */}
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/create">Forger un Token</NavLink>
            <NavLink to="/tokens">Mes Tokens</NavLink>
            <NavLink to="/plans">Plans & Tarifs</NavLink>
            <NavLink to="/staking">Staking</NavLink>
            <NavLink to="/launchpad">Launchpad</NavLink>
          </HStack>
        </HStack>

        {/* Menu Mobile */}
        <Box display={{ base: 'block', md: 'none' }}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
            />
            <MenuList>
              <MenuItem as={Link} to="/create">Forger un Token</MenuItem>
              <MenuItem as={Link} to="/tokens">Mes Tokens</MenuItem>
              <MenuItem as={Link} to="/plans">Plans & Tarifs</MenuItem>
              <MenuItem as={Link} to="/staking">Staking</MenuItem>
              <MenuItem as={Link} to="/launchpad">Launchpad</MenuItem>
            </MenuList>
          </Menu>
        </Box>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={7}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
            <ConnectButton />
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
