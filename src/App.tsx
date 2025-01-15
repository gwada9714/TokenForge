import Header from './components/Header/Header';
import { Toaster } from 'react-hot-toast';
import AppRouter from './components/Router/AppRouter';
import { UserPlanProvider } from './contexts/UserPlanContext';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { forgeTheme } from './theme/forge-theme';

function App() {
  return (
    <ChakraProvider theme={forgeTheme}>
      <CSSReset />
      <UserPlanProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <AppRouter />
          </main>
          <Toaster position="bottom-right" />
        </div>
      </UserPlanProvider>
    </ChakraProvider>
  );
}

export default App;