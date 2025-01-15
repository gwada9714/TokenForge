import React from 'react';
import Header from './components/Header/Header';
import { Toaster } from 'react-hot-toast';
import AppRouter from './components/Router/AppRouter';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AppRouter />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;