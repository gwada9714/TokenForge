import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Tokens } from './pages/Tokens';
import { TokenDetails } from './pages/TokenDetails';
import { CreateToken } from './pages/CreateToken';
import { Header } from './components/Header/Header';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/tokens/create" element={<CreateToken />} />
          <Route path="/tokens/:tokenId" element={<TokenDetails />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;