import { Buffer } from 'buffer';
import process from 'process';

if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = Buffer;
}

if (typeof (window as any).process === 'undefined') {
  (window as any).process = process;
}

// Polyfill pour fetch
if (typeof (window as any).fetch === 'undefined') {
  (window as any).fetch = fetch;
}

// Polyfill pour TextEncoder
if (typeof (window as any).TextEncoder === 'undefined') {
  (window as any).TextEncoder = TextEncoder;
}

// Polyfill pour TextDecoder
if (typeof (window as any).TextDecoder === 'undefined') {
  (window as any).TextDecoder = TextDecoder;
}
