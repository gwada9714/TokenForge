declare module 'Web3Providers' {
    import { ReactNode } from 'react';

    export interface Web3ProviderProps {
        children: ReactNode;
    }

    export const Web3Provider: React.FC<Web3ProviderProps>;
}
