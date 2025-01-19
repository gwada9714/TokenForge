/// <reference types="@testing-library/jest-dom" />

declare global {
  interface Window {
    ethereum: any
    Buffer: typeof Buffer;
  }
}

import { Buffer } from 'buffer';

export {} 