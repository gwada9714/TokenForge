interface ImportMetaEnv {
  VITE_INFURA_PROJECT_ID: string;
  VITE_ETHERSCAN_API_KEY: string;
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
