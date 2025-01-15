interface Workbox {
  addEventListener: (event: string, callback: (event: any) => void) => void;
  register: () => Promise<void>;
  // Add other workbox methods you're using
}

declare interface Window {
  workbox: Workbox;
}
