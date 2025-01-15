import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/Header/Header';
import { Toaster } from 'react-hot-toast';

// Lazy loading des composants
const Home = lazy(() => import('./pages/Home/index'));
const Tokens = lazy(() => import('./pages/Tokens'));
const TokenDetails = lazy(() => import('./pages/TokenDetails'));
const CreateToken = lazy(() => import('./pages/CreateToken'));

// Composant de chargement
const Loading = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/tokens/create" element={<CreateToken />} />
              <Route path="/tokens/:tokenId" element={<TokenDetails />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <p className="text-center text-gray-500 text-sm">
            {new Date().getFullYear()} TokenForge. All rights reserved.
          </p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;