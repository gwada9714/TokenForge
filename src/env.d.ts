/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TOKEN_FACTORY_SEPOLIA: string
    // Ajoutez ici d'autres variables d'environnement si nécessaire
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }