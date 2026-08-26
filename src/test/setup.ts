import '@testing-library/jest-dom';

// Polyfill for ResizeObserver in jsdom environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill for scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};
window.Element.prototype.scrollIntoView = function() {};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
