import React from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <nav className="flex gap-4">
          <Link to="/" className="font-bold text-xl">TokenForge</Link>
          <Link to="/tokens" className="hover:text-blue-600">Mes Tokens</Link>
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
};
