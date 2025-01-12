import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">TokenForge</h1>
        <p className="text-xl mb-8 text-gray-600">
          Créez et gérez vos tokens ERC20 en quelques clics
        </p>
        <div className="space-x-4">
          <Link
            to="/tokens/create"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Créer un Token
          </Link>
          <Link
            to="/tokens"
            className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
          >
            Mes Tokens
          </Link>
        </div>
      </div>
    </div>
  );
};