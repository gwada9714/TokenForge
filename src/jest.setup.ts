import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
  [Symbol.iterator]: function* () {
    const items = Object.entries(this);
    for (const [key, value] of items) {
      if (typeof key === 'string') {
        yield [key, value];
      }
    }
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Firebase
jest.mock('./config/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));
