export const mockIntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;

  observe(target: Element) {
    // Trigger the callback with mock entries
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this
    );
  }

  unobserve() {
    // No-op
  }

  disconnect() {
    // No-op
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  root: Element | null = null;
  rootMargin: string = "0px";
  thresholds: readonly number[] = [0];
};
