export const mockResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    // Store the callback
    this.callback = callback;
  }

  callback: ResizeObserverCallback;
  
  observe(target: Element) {
    // Trigger the callback with mock entries
    this.callback([{
      target,
      contentRect: target.getBoundingClientRect(),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: []
    }], this);
  }
  
  unobserve() {
    // No-op
  }
  
  disconnect() {
    // No-op
  }
};
