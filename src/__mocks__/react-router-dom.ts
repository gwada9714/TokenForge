import { vi } from 'vitest';

// Mock pour useNavigate
const navigate = vi.fn();
export const useNavigate = vi.fn(() => navigate);

// Mock pour useLocation
export const useLocation = vi.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
}));

// Mock pour useParams
export const useParams = vi.fn(() => ({}));

// Mock pour useRouteMatch
export const useRouteMatch = vi.fn(() => ({
  path: '/',
  url: '/',
  isExact: true,
  params: {}
}));

// Mock pour Link et autres composants
export const Link = ({ children }: { children: React.ReactNode }) => children;
export const NavLink = ({ children }: { children: React.ReactNode }) => children;
export const Navigate = ({ children }: { children: React.ReactNode }) => children;
export const Outlet = () => null;

// Mock pour BrowserRouter et autres routeurs
export const BrowserRouter = ({ children }: { children: React.ReactNode }) => children;
export const Routes = ({ children }: { children: React.ReactNode }) => children;
export const Route = () => null;

// Export par défaut pour les mocks ESM
export default {
  useNavigate,
  useLocation,
  useParams,
  useRouteMatch,
  Link,
  NavLink,
  Navigate,
  Outlet,
  BrowserRouter,
  Routes,
  Route
};
