import { Buffer } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  // Éviter la redéfinition si déjà défini
  if (!window.Buffer) window.Buffer = Buffer;
  if (!window.process) window.process = process;
  
  // Nécessaire pour WalletConnect
  window.global = window;
}

export {};
